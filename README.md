# 🛒 E-Commerce Backend – Auth & Order Module

This backend provides secure authentication using **Access + Refresh Tokens** and a fully ACID-compliant **order management system** with **MongoDB transactions** to handle stock reservation, payment verification, and rollback on payment failures.

---

## 🔐 Authentication Module

### Features
- Signup with **email OTP verification**
- Login with **password or Google OAuth**
- **Access/Refresh Token flow**  
  - Access Token: 15 min  
  - Refresh Token: 7 days  
- Auto token refresh via `/refresh-token`
- Secure **HttpOnly cookies**
- Logout + profile retrieval

---

## 🛍️ Order Module (MongoDB Transactions)

### 1️⃣ Create Order (Stock Reservation)
When user starts checkout:
- Transaction begins
- Stock is **decremented**
- `locked` stock is **incremented**
- A new **Pending order** is created
- If Razorpay order creation fails → stock is restored (compensating transaction)

### 2️⃣ Place Order (Payment Success)
- Razorpay signature is verified
- Transaction updates:
  - `locked` stock → decreases
  - Order status → **Paid**
  - Cart is deleted
- Ensures atomicity across documents

### 3️⃣ Failed Payment – Release Locked Stock
- Transaction restores:
  - Stock → increment
  - Locked stock → decrement
- Order marked as *Payment Failed*

---

## ⚙️ Why Use Transactions?
Because operations touch **multiple collections** (Product, Order, Cart), transactions guarantee:

- No overselling  
- Atomic stock reservation  
- Consistent order states  
- Safe rollback on payment issues  

---

## 📡 Main Endpoints

### Auth
- `POST /signup`
- `POST /verify-email`
- `POST /login`
- `GET /refresh-token`
- `GET /profile`
- `POST /logout`

### Orders
- `POST /order/create` – reserve stock + create Razorpay order  
- `POST /order/place` – confirm payment  
- `POST /order/release` – restore stock on payment failure  
- `GET /orders/me` – fetch user’s orders  

---

## 🧰 Tech Stack
- **Node.js + Express**
- **MongoDB + Mongoose Transactions**
- **JWT Authentication**
- **Razorpay Payment Gateway**

---

## 📄 Summary
This backend ensures:
- Secure user authentication  
- Safe stock operations  
- Atomic and consistent order processing  
- Full rollback mechanisms during payment failures  

Perfect for scalable e-commerce applications.

