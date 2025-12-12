// routes/adminRoutes.js
import express from 'express'
import authController from '../controllers/auth.controller.js';




const router = express.Router();
router.post('/signup',authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.google);
// router.get("/check-session", verifyAccessToken, (req, res) => {
//     console.log("Session is valid for user");
//   res.json({ message: "Session is valid", userId: req.user });
// });
// router.post("/verify-email", adminController.verifyEmail);
// router.get('/profile',verifyAccessToken,adminController.profile);
// router.get('/orders',verifyAccessToken, adminController.getOrders);

// router.put('/orders/:id',verifyAccessToken, adminController.updateOrderStatus);
// router.get('/stats',verifyAccessToken, adminController.getOrderStats);
// router.post('/logout',verifyAccessToken, adminController.logOut);
// router.post('/logout',verifyAccessToken, adminController.logOutAllDevices);
// router.post('/savecontact',verifyAccessToken, adminController.saveContact);
// router.put('/make-admin', verifyAccessToken, adminController.grantAdminAccess);
// router.put('/remove-admin', verifyAccessToken, adminController.revokeAdminAccess);
// router.get('/users', verifyAccessToken, adminController.listAllUsers);

export default router;