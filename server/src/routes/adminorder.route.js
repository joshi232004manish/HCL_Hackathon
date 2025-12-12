import express from 'express';
import {
  getAllOrdersUser,
  updateOrderStatus,
  
} from '../controllers/adminorder.controller.js';
import  verifyAccessToken  from '../middlewares/auth.js';
const router = express.Router();
// only by admin
router.get("/order",verifyAccessToken,getAllOrdersUser);
router.put('/status/:orderId',verifyAccessToken,updateOrderStatus);

export default router;