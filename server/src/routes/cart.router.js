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

router.post('/add',verifyAccessToken, addToCart);
router.get("/items", verifyAccessToken, getCartItems);
router.put('/update/:productId',verifyAccessToken ,updateCartItem);
router.delete('/remove/:productId',verifyAccessToken, removeCartItem);
router.put('/clear',verifyAccessToken, clearCart);

export default router;
