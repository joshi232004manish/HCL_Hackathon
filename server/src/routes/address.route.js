import express from 'express'
import {updateAddress,getAddress} from '../controllers/address.controller.js';
import auth from '../middlewares/auth.js';
import { get } from 'mongoose';
import verifyAccessToken from '../middlewares/auth.js';


const router = express.Router();
//it is that route to save user address to the admin/user model
router.post('/update/address',verifyAccessToken,updateAddress);
router.get('/my/address',verifyAccessToken,getAddress);
export default router;