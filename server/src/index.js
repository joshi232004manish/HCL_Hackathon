import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import orderRouter from './routes/order.routes.js'
import AuthRouter from './routes/auth.routes.js';
import cartRoutes from './routes/cart.router.js';
import updateaddress from './routes/address.route.js';
import orderRouterAdmin from './routes/adminorder.route.js';

dotenv.config();




mongoose.connect(process.env.MONGO).then(() => {
  console.log('MongoDB connected')
}   ).catch(err => {    
  console.error('MongoDB connection error:', err)
});



const app = express();
const port = process.env.PORT || 3000;


app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
); 
app.use(express.json())



app.get('/api/health', (req, res) => {
  return res.status(200).json({ ok: true });
});




app.use('/api/orders',orderRouter);
app.use('/api/auth',AuthRouter);

app.use('/api',updateaddress)
app.use('/api/cart', cartRoutes);
app.use("/api/admin", orderRouterAdmin);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
