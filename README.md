# InstaStock - Inventory & Business Management Platform

<p align="center">
  <img src="https://cdn.worldvectorlogo.com/logos/github-icon-2.svg" alt="InstaStock Logo" width="120" />
</p>

<p align="center">
  A comprehensive inventory management and business management web application built with React, Supabase, and Tailwind CSS.
</p>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/react-19-61DAFB?style=for-the-badge" alt="React" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/supabase-2.95.3-3ECF8E?style=for-the-badge" alt="Supabase" />
  </a>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Key Components](#-key-components)
- [Pages Overview](#-pages-overview)

---

## 🚀 Features

### Core Business Features
- ✅ **Real-time Tracking** - Monitor inventory levels across Instagram shops and locations
- ✅ **Stock Alerts** - Instant notifications when stock runs low
- ✅ **Order Sync** - Auto-sync orders from Instagram DMs/comments to inventory
- ✅ **Product Management** - Full CRUD for products with categories, SKUs, pricing, images
- ✅ **Customer Management** - Track customers, lifetime value, repeat orders, history (with import)
- ✅ **Purchase Orders** - Manage supplier purchase orders and inventory replenishment
- ✅ **Order Management** - Create/manage orders with payment/order statuses
- ✅ **Invoice Generation** - Professional PDF invoices with auto-numbering

### Dashboard & Analytics
- ✅ **Analytics Dashboard** - Detailed sales trends, best-sellers, inventory performance insights
- ✅ **Dashboard Home** - Stat cards, charts (orders line, visitors area), recent activity
- ✅ **Sales Analytics** - Visual charts: trends, top-selling products
- ✅ **Visitor Analytics** - Track patterns and engagement
- ✅ **Performance Metrics** - Business insights (time-period stats, stock summary)

### Productivity Tools
- ✅ **Checklists** - Create and manage task lists
- ✅ **Guides/Documentation** - Create and organize business guides
- ✅ **Feedback System** - Collect and manage user feedback

### Communication
- ✅ **Contact Form** - EmailJS integration for customer inquiries
- ✅ **WhatsApp Integration** - Quick WhatsApp links for customer communication
- ✅ **Instagram Handle Tracking** - Track customer Instagram accounts

### Security & User Management
- ✅ **Authentication** - Secure signup/login with Supabase Auth
- ✅ **Protected Routes** - Dashboard access restricted to authenticated users
- ✅ **Row Level Security** - Database-level security policies
- ✅ **Profile Management** - Business profile with logo and details

---

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend Framework** | React | ^19.2.0 |
| **Build Tool** | Vite | ^7.2.4 |
| **Styling** | Tailwind CSS (w/ Vite plugin) | ^4.1.18 |
| **Routing** | React Router DOM | ^7.13.0 |
| **Backend/Auth/DB** | Supabase | ^2.95.3 |
| **Charts** | ApexCharts + react-apexcharts | ^5.3.6 + ^1.9.0 |
| **PDF Generation** | jsPDF + jsPDF-AutoTable | ^4.1.0 + ^5.0.7 |
| **Email Service** | @emailjs/browser | ^4.4.1 |
| **Icons** | React Icons + @heroicons/react | ^5.5.0 + ^2.2.0 |
| **Data/CSV** | PapaParse + XLSX | ^5.5.3 + ^0.18.5 |
| **Utilities** | Lodash | ^4.17.23 |
| **Linting** | ESLint | ^9.39.1 |

---

## 📁 Project Structure

```
d2d portfolio/
├── public/                      # Static public assets
│   └── vite.svg                # Vite logo
├── src/                        # Source code
│   ├── assets/                 # Static assets (images, logos)
│   │   └── logo.png           # App logo
│   ├── components/             # Reusable UI components
│   │   ├── about/              # About section component
│   │   ├── contact/            # Contact form component
│   │   ├── features/           # Features showcase
│   │   ├── footer/             # Footer component
│   │   ├── hero/               # Hero section
│   │   ├── how it works/       # How it works section
│   │   ├── navbar/             # Navigation bar
│   │   ├── pricing/            # Pricing section
│   │   ├── team/               # Team section
│   │   ├── terms/              # Terms component
│   │   └── testimonials/       # Testimonials section
│   ├── context/                # React Context providers
│   │   └── AuthContext.jsx     # Authentication context
│   ├── dashboard/              # Dashboard components
│   │   ├── pages/              # Dashboard page components
│   │   │   ├── Analytics.jsx
│   │   │   ├── Checklists.jsx
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── Feedback.jsx
│   │   │   ├── Guides.jsx
│   │   │   ├── Hotspots.jsx
│   │   │   ├── Performance.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Themes.jsx
│   │   ├── Alert.jsx
│   │   ├── CustomerModal.jsx
│   │   ├── CustomersTable.jsx
│   │   ├── GraphBlock.jsx
│   │   ├── InvoiceModal.jsx
│   │   ├── MainTable.jsx
│   │   ├── OrderModal.jsx
│   │   ├── OrdersLineChart.jsx
│   │   ├── PendingOrdersTable.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── ProductModal.jsx
│   │   ├── SideBar.jsx
│   │   ├── StatCards.jsx
│   │   ├── StockSummary.jsx
│   │   ├── TimePeriodStats.jsx
│   │   ├── TopSellingProducts.jsx
│   │   ├── UserDetails.jsx
│   │   └── VisitorsAreaCard.jsx
│   ├── lib/                    # Library configurations
│   │   └── supabase.js        # Supabase client configuration
│   ├── pages/                  # Page components
│   │   ├── AboutUs.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── RandomPage.jsx
│   │   ├── SignUp.jsx
│   │   └── TermsAndConditions.jsx
│   ├── App.jsx                 # Main App component with routing
│   ├── index.css               # Global CSS with Tailwind
│   └── main.jsx                # Entry point
├── migrations/                  # Database migrations
│   └── allow_duplicate_order_numbers.sql
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── eslint.config.js             # ESLint configuration
├── vercel.json                  # Vercel deployment config
├── supabase-schema.sql         # Database schema
└── README.md                   # This file
```

---


## 🗄 Database Schema

The database includes the following tables:

### Core Tables
- **`profiles`** - Extends Supabase Auth with business details
- **`products`** - Product inventory with SKUs, categories, pricing
- **`customers`** - Customer information with lifetime value tracking
- **`orders`** - Order management with status and payment tracking
- **`order_items`** - Detailed line items for orders

### Utility Tables
- **`checklists`** - Task list management
- **`checklist_items`** - Individual checklist tasks
- **`guides`** - Documentation and guides
- **`analytics_events`** - Visitor and event tracking
- **`stock_history`** - Inventory change history
- **`invoices`** - Invoice management with auto-numbering
- **`feedback`** - User feedback collection

### Key Database Features
- **Row Level Security (RLS)** - Data isolation per user
- **Auto-generated IDs** - Automatic SKU and order number generation
- **Real-time Subscriptions** - Live data updates
- **Trigger Functions** - Automatic lifetime value updates, stock tracking
- **Indexes** - Optimized query performance

---


## 🧩 Key Components

### Authentication
- **AuthContext** - Manages user authentication state across the app
- Protected and public route components for access control

### Dashboard Components
- **StatCards** - Display key metrics (products, customers, orders, revenue)
- **OrdersLineChart** - Visual representation of order trends
- **TopSellingProducts** - Most popular products
- **CustomersTable** - Paginated customer list
- **PendingOrdersTable** - Orders awaiting action

### Modals
- **ProductModal** - Add/edit products
- **CustomerModal** - Add/edit customers
- **OrderModal** - Create/edit orders
- **InvoiceModal** - Generate invoices

---

## 📄 Pages Overview

### Public Pages (No Authentication Required)
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with features, testimonials |
| Login | `/login` | User login form |
| SignUp | `/signup` | User registration form |
| About Us | `/aboutus` | Company information |
| Terms | `/terms` | Terms and conditions |

### Protected Pages (Authentication Required)
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Main dashboard with overview |
| Analytics | `/dashboard/analytics` | Sales and visitor analytics |
| Checklists | `/dashboard/checklists` | Task management |
| Guides | `/dashboard/guides` | Documentation management |
| Feedback | `/dashboard/feedback` | User feedback management |
| Settings | `/dashboard/settings` | App settings |

---


