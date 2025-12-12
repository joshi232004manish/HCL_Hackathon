import express from 'express';

import {
  placeorder,
  getMyOrders,
  getOrderById,
  createRazorpayOrder,
  releaseLockedStock,
  
} from '../controllers/order.controller.js';


const router = express.Router();

router.post('/place',placeorder);
router.post('/create', createRazorpayOrder);
router.get('/my-orders', getMyOrders);
router.post("/release-lock", releaseLockedStock);

router.get('/get/:id', getOrderById);


export default router;
