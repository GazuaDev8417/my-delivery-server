# ⚡ My Delivery Server — Multi-Tenant Backend API Service

[![Portfolio](https://img.shields.io/badge/Author-Flamarion_França-007acc?style=for-the-badge&logo=render)](https://portfolio-vtu0.onrender.com)
[![Language](https://img.shields.io/badge/Node.js-TypeScript-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-Knex.js-orange?style=for-the-badge&logo=postgresql)](https://knexjs.org/)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-85ea2d?style=for-the-badge&logo=swagger&logoColor=black)](https://my-delivery-server-nine.vercel.app/api-docs/)


> **Ecosystem Core:** *My Delivery Server* is the centralized RESTful API powering the entire multi-application ecosystem. It coordinates real-time transactions, authentication, and database operations between **[My Delivery](https://my-delivery-silk.vercel.app)** (Consumer Web App), **[My Delivery Provider](https://my-delivery-provider.vercel.app)** (Merchant Operations Hub), and feeds data metrics into the **[SaaS Dashboard](https://dashboard-project-nu-one.vercel.app/)** (Business Intelligence Engine).

---

## 📖 API Documentation

Explore endpoints, schema definitions, authentication strategies, and test requests live in the interactive OpenAPI/Swagger documentation:

👉 **[Live Swagger Documentation](https://my-delivery-server-nine.vercel.app/api-docs/)**\
💼 **Developer Portfolio:** [https://portfolio-vtu0.onrender.com](https://portfolio-vtu0.onrender.com)

---

## 🏛️ Ecosystem Integration

```text
 ┌─────────────────────────┐          ┌─────────────────────────┐
 │   My Delivery (Client)  │          │   My Delivery Provider  │
 │  (Order & Checkout UI)  │          │  (Merchant Operations)  │
 └────────────┬────────────┘          └────────────┬────────────┘
              │                                    │
              └─────────────────┬──────────────────┘
                                ▼
                 ┌──────────────────────────────┐
                 │    My Delivery API Server    │
                 │   (Node / Express / Knex)    │
                 └──────────────┬───────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │       SaaS Dashboard         │
                 │     (Analytics & Metrics)    │
                 └──────────────────────────────┘