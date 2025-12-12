import express from 'express';
import {
  addToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller.js';
import auth from "../middlewares/auth.js";
import verifyAccessToken from '../middlewares/auth.js';


const router = express.Router();

router.post('/add', addToCart);
router.get("/items", getCartItems);
router.put('/update/:productId' ,updateCartItem);
router.delete('/remove/:productId', removeCartItem);
router.put('/clear', clearCart);

export default router;
