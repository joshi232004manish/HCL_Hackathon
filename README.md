# 🛒 E-Commerce Backend – Auth & Order Module  
### Developed by: **Manish Joshi**

This section of the backend includes the **Authentication** system and the **Order Management Module**, implemented using secure token-based authentication and MongoDB ACID transactions.

---

## 🔐 Authentication Module

### Features
- Signup with **email OTP verification**
- Login with **password or Google OAuth**
- **Access/Refresh Token flow**  
  - Access Token: 15 minutes  
  - Refresh Token: 7 days  
- Auto token refresh via `/refresh-token`
- Secure **HttpOnly cookies**
- Logout + user profile API

---

## 🛍️ Order Module (MongoDB Transactions)

### 1️⃣ Create Order – Stock Reservation
Inside a MongoDB transaction:
- Decrease product **stock**
- Increase **locked** stock
- Create a **Pending** order
- If Razorpay order creation fails → **stock is restored**

### 2️⃣ Place Order – Payment Success
- Razorpay signature verification
- Transaction updates:
  - `locked` stock → decreased
  - Order status → **Paid**
  - Payment info saved
  - User cart deleted

### 3️⃣ Release Locked Stock – Payment Failure
If payment fails:
- Restore normal stock
- Reduce locked stock
- Update order status → *Payment Failed*

---

## ⚙️ Why MongoDB Transactions?
These operations span multiple documents (Product, Order, Cart), so transactions ensure:

- No overselling  
- Atomic stock reservation  
- Consistent order states  
- Automatic rollback during failure  

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
- `POST /order/create` – reserve stock + Razorpay order  
- `POST /order/place` – confirm payment  
- `POST /order/release` – refund stock  
- `GET /orders/me` – list user orders  

---

## 🧰 Tech Stack
- **Node.js + Express**
- **MongoDB + Mongoose Transactions**
- **JWT Authentication**
- **Razorpay Payment Gateway**

---

## 📄 Summary
This module ensures:
- Secure user auth  
- Reliable stock reservation  
- Atomic and consistent order processing  
- Full rollback on payment failures  

Additional contributors may append their modules and names below as the project expands.
