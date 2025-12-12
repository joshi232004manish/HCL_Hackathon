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

# 🛒 E-Commerce Frontend – React
### Developed by: **Manish Joshi**

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

