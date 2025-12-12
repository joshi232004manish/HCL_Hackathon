import Order from "../models/ordermodel.js";
import { Cart } from "../models/cartmodel.js";
import Product from "../models/productmodel.js";
import crypto from "crypto";

import mongoose from "mongoose";



export const releaseLockedStock = async (req, res) => {
  const { razorpayOrderId } = req.body;
  if (!razorpayOrderId) return res.status(400).json({ message: "Missing Razorpay order ID" });

  const session = await mongoose.startSession();
  try {
    
    await session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});

    const order = await Order.findOne({ razorpayOrderId }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    
    for (const item of order.products) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;
      product.stock = (typeof product.stock === "number" ? product.stock : 0) + item.quantity;
      product.locked = Math.max(0, (typeof product.locked === "number" ? product.locked : 0) - item.quantity);
      await product.save({ session });
    }

    order.status = "Payment Failed";
    order.statusMessage = "Order cancelled due to payment dismissal/failure.";
    await order.save({ session });

    await session.commitTransaction();
    return res.status(200).json({ message: "Stock released successfully." });
  } catch (err) {
    try { await session.abortTransaction(); } catch (e) { console.error("Abort failed:", e); }
    console.error("Error releasing stock:", err);
    return res.status(500).json({ message: "Server error while releasing stock" });
  } finally {
    session.endSession();
  }
};

export const createRazorpayOrder = async (req, res) => {
  const { amount, selectedAddress } = req.body; 
  const userId = req.user;

  if (!amount) return res.status(400).json({ message: "Amount required" });

  
  const cart = await Cart.findOne({ user: userId });
  if (!cart || !cart.products || cart.products.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const session = await mongoose.startSession();
  let createdOrderId = null;
  try {
   await session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});

    const formattedProducts = [];
    
    for(const item of cart.products){
      const dbProduct = await Product.findById(item.product).session(session);
      if (!dbProduct) {
        throw { code: 404, message: `Product not found: ${item.product}` };
      }
      if (dbProduct.stock < item.quantity) {
        throw { code: 400, message: `Insufficient stock for ${dbProduct.name}` };
      }

      // Update DB (atomic within transaction)
      dbProduct.stock -= item.quantity;
      dbProduct.locked = (typeof dbProduct.locked === "number" ? dbProduct.locked : 0) + item.quantity;
      await dbProduct.save({ session });

      formattedProducts.push({ product: dbProduct._id, quantity: item.quantity });
    }

    // create a Pending order inside transaction
    const newOrder = new Order({
      user: userId,
      products: formattedProducts,
      totalPrice: cart.totalPrice,
      address: selectedAddress,
      paymentMethod: "Razorpay",
      razorpayOrderId: null, // will set after creating Razorpay order
      status: "Pending",
      statusMessage: "Reserved - awaiting payment",
    });

    const saved = await newOrder.save({ session });
    createdOrderId = saved._id;

    // commit DB changes (reservation)
    await session.commitTransaction();

    // create Razorpay order (outside transaction)
    const razorpay = makeRazorpay();
    const options = {
      amount,
      currency: "INR",
      receipt: generateReceipt(),
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
      await Order.findByIdAndUpdate(createdOrderId, { razorpayOrderId: razorpayOrder.id });
    } catch (err) {
      // If Razorpay creation fails, revert the reservation in a compensating transaction
      const revertSession = await mongoose.startSession();
      try {
        await revertSession.startTransaction();

        // revert stock and locked
        for (const p of formattedProducts) {
          const prod = await Product.findById(p.product).session(revertSession);
          if (!prod) continue;
          prod.stock = (typeof prod.stock === "number" ? prod.stock : 0) + p.quantity;
          prod.locked = Math.max(0, (typeof prod.locked === "number" ? prod.locked : 0) - p.quantity);
          await prod.save({ session: revertSession });
        }

        // delete the created order
        await Order.findByIdAndDelete(createdOrderId).session(revertSession);

        await revertSession.commitTransaction();
      } catch (revertErr) {
        try { await revertSession.abortTransaction(); } catch (e) { console.error("Abort revert failed:", e); }
        console.error("Failed to revert after Razorpay create failure:", revertErr);
      } finally {
        revertSession.endSession();
      }

      console.error("Razorpay order creation failed:", err);
      return res.status(500).json({ message: "Order creation failed (payment provider error)" });
    }

    // attach razorpayOrderId to the DB order (separate update)
   

    return res.status(200).json(razorpayOrder);
  } catch (err) {
    // abort main transaction if still active
    try { await session.abortTransaction(); } catch (abortErr) { console.error("Abort error:", abortErr); }
    console.error("Reservation failed:", err);
    if (err && err.code && err.message) return res.status(err.code).json({ message: err.message });
    return res.status(500).json({ message: "Failed to reserve products" });
  } finally {
    session.endSession();
  }
};



export const placeorder = async (req, res) => {
  try {
    const userId = req.user;
    const selectedAddress = req.body.selectedAddress;
    const razorpaySignature = req.body.razorpaySignature;
    const razorpayPaymentId = req.body.razorpayPaymentId;
    const razorpayOrderId = req.body.razorpayOrderId;
    const secret = process.env.RAZORPAY_SECRET;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification data." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    if (!selectedAddress || !selectedAddress.street || !selectedAddress.city || !selectedAddress.state) {
      return res.status(400).json({ message: "Incomplete or missing address from request." });
    }

    
    const cart = await Cart.findOne({ user: userId }).populate("products.product");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const session = await mongoose.startSession();
    try {
      await session.startTransaction();

      
      const order = await Order.findOne({ razorpayOrderId }).session(session);
      if (!order) {
        throw { code: 404, message: "Order not found." };
      }
      if (order.status !== "Pending") {
        throw { code: 400, message: `Order is not pending (current: ${order.status}).` };
      }

      
      for (const item of order.products) {
        const dbProduct = await Product.findById(item.product).session(session);
        if (!dbProduct) throw { code: 404, message: `Product not found: ${item.product}` };

        
        dbProduct.locked = (typeof dbProduct.locked === "number" ? dbProduct.locked : 0) - item.quantity;
        if (dbProduct.locked < 0) dbProduct.locked = 0;
        await dbProduct.save({ session });
      }

      
      order.status = "Paid";
      order.paymentInfo = { razorpayPaymentId, paidAt: new Date() };
      order.statusMessage = "Payment successful. Order confirmed.";
      order.address = selectedAddress;
      await order.save({ session });

      
      await Cart.findOneAndDelete({ user: userId }).session(session);

      await session.commitTransaction();

      return res.status(201).json({ message: "Order placed successfully.", orderId: order._id });
    } catch (err) {
      try { await session.abortTransaction(); } catch (abErr) { console.error("Abort failed:", abErr); }
      console.error("Error placing order transaction:", err);
      if (err && err.code && err.message) return res.status(err.code).json({ message: err.message });
      return res.status(500).json({ message: "Internal server error while placing order." });
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error("Place order error:", err);
    return res.status(500).json({ message: "Server error during order placement." });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("products.product");
    return res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    return res.status(500).json({ message: "Error fetching orders." });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user").populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found." });
    return res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    return res.status(500).json({ message: "Error retrieving order." });
  }
};
