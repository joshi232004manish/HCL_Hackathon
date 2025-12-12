import mongoose , { Schema } from 'mongoose';
const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  totalPrice: Number,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'PayPal', 'Cash on Delivery'],
    default: 'Credit Card'
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Out For Delivery', 'Delivered', 'Cancelled', 'Other'], 
    default: 'Pending' 

  },
  statusMessage: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Order', orderSchema);
