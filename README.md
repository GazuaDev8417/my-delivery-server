# 🛵 My Delivery — Backend API Service

A robust, multi-tenant RESTful API powering the **My Delivery** ecosystem (both Customer-Facing and Merchant Provider applications). Built with **Node.js**, **Express**, **TypeScript**, and **Knex.js**, adhering strictly to **Clean Architecture** and **Dependency Injection** principles.

> **🌐 Portfolio Note:** Designed for real-world operations in the Brazilian food delivery market (handling localized CEP addressing, CPF validation, Cloudinary asset uploads, and Mercado Pago integration for Pix/Card transactions). All source code, architecture patterns, and endpoint documentation are maintained in English to showcase full-stack engineering standards to international teams.

---

## 🏗️ Architecture & Core Concepts

The server uses a strict **3-Tier Layered Architecture** with explicit manual Dependency Injection at the router level (`Router -> Controller -> Business -> Data`):# my-delivery-server
The API server side of the my-delivery and my-delivery-provider application


1. **Controllers (`/controller`):** Parse HTTP requests, delegate logic to the Business layer, handle error mapping (`AppError`), and return clean response payloads.
2. **Business (`/business`):** Enforces core domain rules, regex validations (email/phone), timezone conversions (`America/Sao_Paulo`), external payment calls (Mercado Pago), and password hashing.
3. **Data (`/data`):** Manages raw database interactions using Knex query builders and transactional boundaries (`trx`).
4. **Cloudinary Stream Pipeline (`/config/multer`):** Intercepts multipart requests in memory using Multer, streaming image buffers straight to Cloudinary without writing temporary files to disk.

---

## 🚀 Key Features

* **Cloudinary Media Storage:** Direct memory-buffer image upload pipeline (`uploadToCloudinary`) for product catalog management with a 5MB threshold.
* **Mercado Pago Integration:** Real-time payment processing supporting instant Pix QR codes and Credit Cards with dynamic idempotency keys (`X-Idempotency-Key`).
* **Expired Order Purging:** Automatic timezone-aware date parsing that clears pending orders prior to the current day.
* **Transactional Account Erasure:** Atomically purges user accounts and associated active/historical order records using Knex transactions.
* **Dual Role Security:** Custom `Services` authentication handling multi-tenant JWT verification (separating Customer identity from Merchant permissions).

---

## 🛠️ Tech Stack

* **Runtime & Language:** Node.js, TypeScript
* **Web Framework:** Express.js
* **Database & Query Builder:** PostgreSQL / MySQL, Knex.js
* **Media Management:** Cloudinary API, Multer (Memory Storage)
* **Authentication & Cryptography:** JWT (JSON Web Tokens), bcrypt, UUID
* **Date Handling:** `moment-timezone` (`America/Sao_Paulo`)
* **Payment Processing:** Mercado Pago REST API & Axios

---

## 🚦 Endpoint Directory


> **🌐 Signup Note:** Since this is a demonstration of a freelance project, I chose not to include the Signup component in either frontend application, as fixed credentials are already provided in the input fields. This allowed me to avoid an accidental influx of users into a demo application.

### 👤 Users (`/users`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/users/signup` | Public | Register a new customer |
| `POST` | `/users/login` | Public | Authenticate user & return JWT token |
| `POST` | `/users/password/reset-request` | Public | Trigger password reset (anti-enumeration safe) |
| `POST` | `/users/password/reset-confirm` | Public | Set new password via token |
| `GET` | `/users/profile` | User Token | Fetch authenticated customer profile |
| `GET` | `/users/profile/:id` | Merchant Token | Fetch client details for order dispatch |
| `PUT` | `/users/profile` | User Token | Update user personal details |
| `PUT` | `/users/address` | User Token | Update delivery address (CEP, city, state) |
| `DELETE` | `/users/account` | User Token | Delete account and all orders in a transaction |

### 🏪 Restaurants & Products (`/restaurants`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/restaurants/signup` | Public | Register a restaurant merchant |
| `POST` | `/restaurants/login` | Public | Authenticate restaurant & return JWT token |
| `GET` | `/restaurants/profile` | Merchant Token | Fetch merchant profile data |
| `GET` | `/restaurants/` | Public | Fetch public restaurant metadata |
| `GET` | `/restaurants/products` | Public | Fetch full product menu |
| `GET` | `/restaurants/product/:id` | Merchant Token | Fetch specific product by ID |
| `POST` | `/restaurants/product` | Merchant Token | Upload product image to Cloudinary & create product |
| `PUT` | `/restaurants/product/:id` | Merchant Token | Update product metadata & optional image stream |
| `PUT` | `/restaurants/update` | Merchant Token | Update restaurant details |
| `DELETE` | `/restaurants/product/:id` | Merchant Token | Delete product from menu |

### 📦 Orders & Payments (`/orders`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/orders/` | User Token | Add product item to active order cart |
| `GET` | `/orders/active` | User Token | Retrieve customer active cart |
| `GET` | `/orders/history` | User Token | Fetch customer finished order history |
| `GET` | `/orders/all` | Merchant Token | Fetch all incoming restaurant orders |
| `GET` | `/orders/user/:id` | Merchant Token | Fetch active orders for specific client |
| `GET` | `/orders/:id` | User Token | Fetch single order details |
| `PATCH` | `/orders/:id/quantity` | User Token | Adjust item quantity in cart |
| `PATCH` | `/orders/finish_orders` | User Token | Batch finish active customer orders |
| `PATCH` | `/orders/:id/finish` | Merchant Token | Transition order status to `FINISHED` |
| `PATCH` | `/orders/:id/revert` | Merchant Token | Revert order status to `REQUESTED` |
| `DELETE` | `/orders/history` | User Token | Purge finished order history |
| `DELETE` | `/orders/provider/:id` | User Token | Clear requested orders by provider |
| `DELETE` | `/orders/:id` | User Token | Delete individual order item |
| `POST` | `/orders/payment` | User Token | Process Mercado Pago payment (Pix / Credit Card) |
| `GET` | `/orders/payment/:id/status` | User Token | Check payment status |

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory:

```env
PORT=3003

# Database Connection
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=mydelivery_db

# JWT & Cryptography
JWT_KEY=your_jwt_secret

# Mercado Pago Integration
ACCESS_TOKEN=your_mercadopago_access_token

# Cloudinary Media Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

---

<br>

> **🌐 Important Note:** I avoided using screenshots in the frontend READMEs so that developers—and especially recruiters—would feel intrigued to visit the applications. This way, they can see how they work firsthand and perhaps even contribute, offer suggestions, and make improvements.

---

## 👨‍💻 Author

Developed by **Flamarion França** \
Portolio page: https://portfolio-vtu0.onrender.com \
Application link: https://my-delivery-provider.vercel.app \
The Customer-Facing application link: https://my-delivery-omega.vercel.app