import express from 'express'
import Product from '../models/product.model.js';
import upload from '../middlewares/multer.js'; 
import { createProduct, getProduct, getProducts,updateProduct,uploadImage,deleteProduct } from '../controllers/product.controller.js';
import verifyAccessToken from '../middlewares/auth.js';

const router = express.Router();


//router.post("/upload", upload.single("image"),uploadImage);
router.post("/upload", upload.array("image", 10),verifyAccessToken, uploadImage);
// router.delete('/delete/:id',deleteListing);
// router.post('/update/:id',updateListing);
router.get('/get/:id',getProduct);
router.get('/get',getProducts);
//only for admin
router.post('/create',verifyAccessToken,createProduct);
router.delete('/delete/admin/:id', verifyAccessToken, deleteProduct);
router.put('/update/admin/:id',verifyAccessToken,updateProduct);
export default  router;