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
---
---
---

# 🛒 E-Commerce Frontend – React
### Developed by: **Abhijeet Raj**

A sleek, modern e-commerce application built with React and Vite, featuring a complete shopping experience with product catalog, cart management, user authentication, and responsive design.
---
## 🚀 Features

### Core Functionality
- **Product Catalog** - Browse products across multiple categories (Audio, Home, Furniture, Accessories, Travel, Kitchen)
- **Product Details** - Detailed product pages with images, descriptions, ratings, and specifications
- **Shopping Cart** - Add, update, and remove items with real-time quantity management
- **User Authentication** - Login and signup functionality with persistent sessions
- **User Profile** - Manage user account information
- **Category Filtering** - Filter products by category for easy navigation
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### User Experience
- **Modern UI/UX** - Clean, minimalist design with smooth interactions
- **Hero Section** - Engaging landing page with featured content
- **Product Grid** - Visual product display with cards showing ratings and badges
- **Promotional Banners** - Highlight special offers and announcements
- **Testimonials** - Customer reviews and feedback section
- **Category Navigation** - Intuitive category browsing

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.10.1
- **State Management**: React Context API
- **Styling**: CSS3 with modern design patterns
- **Code Quality**: ESLint with React plugins

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher recommended)
- **npm** (v7 or higher) or **yarn**

## 🏗️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hcl_n
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server with hot module replacement (HMR) |
| `npm run build` | Creates an optimized production build in the `dist` folder |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint to check code quality and catch errors |

## 📁 Project Structure

```
hcl_n/
├── public/                 # Static assets
│   └── vite.svg
├── src/
│   ├── assets/            # Images and static files
│   │   └── react.svg
│   ├── components/        # Reusable UI components
│   │   ├── CategoryBar.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Layout.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── PromoBanner.jsx
│   │   └── Testimonials.jsx
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── data/              # Static data and mock data
│   │   └── products.js
│   ├── pages/             # Page components
│   │   ├── CartPage.jsx
│   │   ├── CatalogPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProductPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── SignupPage.jsx
│   ├── App.jsx            # Main app component with routing
│   ├── App.css            # Global app styles
│   ├── index.css          # Base styles and CSS variables
│   └── main.jsx           # Application entry point
├── dist/                  # Production build output (generated)
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML template
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

## 🎯 Key Features Breakdown

### Authentication System
- User login and registration
- Persistent sessions using localStorage
- Protected routes and user profile management
- Context-based authentication state management

### Shopping Cart
- Add products to cart with quantity selection
- Update item quantities
- Remove items from cart
- Real-time cart summary (subtotal, item count)
- Persistent cart state

### Product Management
- Product catalog with 8+ products
- Category-based filtering (Audio, Home, Furniture, Accessories, Travel, Kitchen)
- Product details with:
  - High-quality images
  - Pricing information
  - Customer ratings and reviews
  - Product highlights and tags
  - Multiple color options
  - Badges (Bestseller, New, Featured, etc.)

### Routing
- Home page (`/`)
- Shop/Catalog (`/shop`)
- Product details (`/product/:productId`)
- Shopping cart (`/cart`)
- Login (`/login`)
- Signup (`/signup`)
- User profile (`/profile`)
- 404 redirect to home page

## 🎨 Design Philosophy

This application follows a modern, minimalist design approach:
- Clean and uncluttered interfaces
- Intuitive navigation
- Consistent spacing and typography
- Smooth transitions and interactions
- Mobile-first responsive design

## 🔧 Development

### Code Style
- ESLint configured with React best practices
- React Hooks linting enabled
- React Refresh for fast development experience

### State Management
- **AuthContext**: Manages user authentication state
- **CartContext**: Handles shopping cart operations and state

### Component Architecture
- Reusable, modular components
- Separation of concerns (pages, components, context)
- Props-based component communication
- Context API for global state

## 🚢 Building for Production

1. **Create production build**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

The production build will be optimized and minified, ready for deployment to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Notes

- User authentication uses localStorage for persistence (suitable for demo purposes)
- Product data is currently static (can be easily replaced with API integration)
- Cart state persists during the session but resets on page refresh (can be enhanced with localStorage)

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For questions or suggestions, please contact the project maintainer.

---

**Built with ❤️ using React and Vite**
---

# 🛒 E-Commerce Full Stack App
### Developed by: **Sagnik Halder**

A full-featured backend-powered e-commerce platform with **product management**, **cart operations**, **address handling**, **image uploads**, **admin order control**, and fully structured **MongoDB schema models**.  

This project provides a solid foundation for an e-commerce platform with all core backend functionality.

---

## 📦 Features

### **1. Product Module**
- Create, Read, Update, Delete products  
- Cloudinary image upload with Multer  
- Public & Admin routes  

### **2. Cart Module**
- Add, update, delete cart items  
- Clear cart  
- Fetch user cart  

### **3. Address Module**
- Save or update user address  
- Fetch user address  

### **4. Image Upload**
- Upload single or multiple images using **Multer + Cloudinary**  

### **5. Admin Order Management**
- View all orders  
- Update order status  
- Supported statuses: `Pending`, `In Process`, `Out for Delivery`, `Delivered`, `Cancelled`  

### **6. Schema Models**
- User  
- OTP  
- Product  
- Cart  
- Address  
- Order  

---

## 📡 API Endpoints

### **Product Endpoints** (`/api/product`)
#### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/product/get` | Get all products |
| GET | `/api/product/get/:id` | Get single product |

#### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/product/create` | Create new product (Admin) |
| PUT | `/api/product/update/admin/:id` | Update product (Admin) |
| DELETE | `/api/product/delete/admin/:id` | Delete product (Admin) |
| POST | `/api/product/upload` | Upload product images (Multer + Cloudinary) |

---

### **Cart Endpoints** (`/api/cart`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart/add` | Add product to cart |
| GET | `/api/cart/items` | Get all cart items |
| PUT | `/api/cart/update/:productId` | Update cart item quantity |
| DELETE | `/api/cart/remove/:productId` | Remove item from cart |
| PUT | `/api/cart/clear` | Clear all items in cart |

---

### **Address Endpoints** (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/update/address` | Save or update user address |
| GET | `/api/my/address` | Get user saved address |

---

### **Admin Order Management Endpoints** (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/order` | Get all orders (Admin) |
| PUT | `/api/admin/status/:orderId` | Update order status |

Supported statuses: `Pending`, `Processing`, `Out for Delivery`, `Delivered`, `Cancelled`, `Other`

---

### **Optional User Order Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/order/create` | Place order from cart |
| GET | `/api/order/myorders` | Get all orders for logged-in user |


---

## 🛠️ Tech Stack
- **Node.js + Express.js**  
- **MongoDB + Mongoose**  
- **Multer + Cloudinary** for image uploads  
- **JavaScript (ES6+)**  
- **RESTful API design**  

---

/src
│
├── models/
│ ├── usermodel.js
│ ├── otpmodel.js
│ ├── productmodel.js
│ ├── cartmodel.js
│ ├── addressmodel.js
│ └── ordermodel.js
│
├── routes/
│ ├── product.routes.js
│ ├── cart.route.js
│ ├── address.route.js
│ ├── auth.route.js
│ ├── adminorder.route.js
│ └── order.routes.js
│
├── controllers/
│ ├── product.controller.js
│ ├── cart.controller.js
│ ├── address.controller.js
│ ├── auth.controller.js
│ ├── adminorder.controller.js
│ └── order.controller.js
│
├── middlewares/
│ ├── auth.js
│ └── multer.js
│
├── config/
│ ├── cloudinary.js
│ └── redisClient.js
│
├── utils/
│ └── sendEmail.js
│
└── index.js


## 📄 Summary

This backend project provides:

- **Full product management** with image uploads  
- **Cart functionality** with add/update/delete operations  
- **Address handling** for users  
- **Admin order control** with status updates  
- **Well-structured MongoDB schema models**  
- **Modular, scalable, and RESTful design**



