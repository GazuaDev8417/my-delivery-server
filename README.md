# ⚡ My Delivery Server — Multi-Tenant Backend API Service

[![Portfolio](https://img.shields.io/badge/Author-Flamarion_França-007acc?style=for-the-badge&logo=render)](https://portfolio-vtu0.onrender.com)
[![Language](https://img.shields.io/badge/Node.js-TypeScript-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-Knex.js%20%26%20PostgreSQL-orange?style=for-the-badge&logo=postgresql)](https://knexjs.org/)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-85ea2d?style=for-the-badge&logo=swagger&logoColor=black)](https://my-delivery-server-nine.vercel.app/api-docs/)

> **Ecosystem Core:** *My Delivery Server* is the centralized RESTful API powering the entire multi-tenant SaaS ecosystem. It coordinates data persistence, transaction execution, security routines, and real-time event notifications connecting **[My Delivery](https://my-delivery-silk.vercel.app)** (Consumer Web App), **[My Delivery Provider](https://my-delivery-provider.vercel.app)** (Merchant Operational Dashboard), and the **[SaaS Control Panel](https://dashboard-project-nu-one.vercel.app/)** (Business Intelligence Engine).

---

## 📖 API Documentation

Explore endpoints, schema definitions, authentication strategies, and request structures live in the interactive OpenAPI/Swagger console:

* 📄 **Live Swagger Documentation:** [https://my-delivery-server-nine.vercel.app/api-docs/](https://my-delivery-server-nine.vercel.app/api-docs/)
* 💼 **Developer Portfolio:** [https://portfolio-vtu0.onrender.com](https://portfolio-vtu0.onrender.com)

---

## 🌟 Technical Highlights & Engineering Decisions

Architected with **Node.js**, **Express**, **TypeScript**, **Knex.js**, and **PostgreSQL (Neon Tech)**, this server implements resilient backend patterns focused on operational data integrity, security, and real-time synchronization:

* **🔔 Integrated Real-Time Notification System:** Centralized event dispatching where incoming consumer orders on *My Delivery* instantly trigger alerts on the provider dashboard, while store catalog updates dynamically push notifications to registered customers.
* **🛡️ Security & Authentication Layer:** Stateless JWT authentication paired with `bcrypt.js` password hashing to enforce role-based access control across consumer, provider, and administrative routes.
* **💳 Dynamic Payment Gateway Integration:** Server-side webhooks and payment processing using `@mercadopago/sdk-react` and API integration, featuring automated background transaction state polling.
* **📂 Media Management Pipeline:** Direct file upload parsing powered by **Multer** for reliable store branding and product image processing.
* **🗄️ Relational Database Management:** Configured with **Knex.js** query builder over serverless **PostgreSQL (Neon Tech)**, utilizing migration pipelines and database seeding routines for 100% cross-application data consistency.
* **📧 Automated Password Recovery:** Integrated transactional email delivery using **Nodemailer** for secure password reset workflows.

---

## 🏛️ Architecture & System Data Flow

```text
 ┌─────────────────────────┐          ┌─────────────────────────┐
 │   My Delivery (Client)  │          │   My Delivery Provider  │
 │  (Order & Checkout UI)  │          │  (Merchant Operations)  │
 └────────────┬────────────┘          └────────────┬────────────┘
              │                                    │
              │ 1. Orders & Menu Queries           │ 2. Store Management & Fulfillment
              └─────────────────┬──────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │    My Delivery Server        │
                 │   (Node / Express / Knex)    │
                 └──────────────┬───────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ PostgreSQL / Neon │ │  Mercado Pago API │ │ SaaS Control Panel│
│ (Data Consistency)│ │ (Payment Polling) │ │ (BI & Analytics)  │
└───────────────────┘ └───────────────────┘ └───────────────────┘