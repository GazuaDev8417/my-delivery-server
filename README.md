# My Delivery Server

The central REST API for the My Delivery ecosystem. The server connects the customer app, the store dashboard, and the SaaS Dashboard, sharing authentication, store and product data, orders, notifications, and statistics.

## The My Delivery ecosystem

- **My Delivery** — the customer app for browsing stores, placing orders, and following the purchase flow.
- **My Delivery Provider** — the store-facing app for receiving and managing orders and maintaining products and store details.
- **SaaS Dashboard** — the management and monitoring dashboard for the ecosystem.
- **My Delivery Server** — the API and integration layer between the applications and external services.

The web apps send their requests to this API. The server validates authentication, applies business rules, and reads or updates shared data, allowing stores to handle customer orders.

## API features

- Customer and store sign-up, authentication, profiles, addresses, and password recovery.
- Store, category, and product discovery and management, including images and stock.
- Order creation and retrieval, status updates, and payment status checks.
- Mercado Pago integration for payment processing and status checks.
- Customer and store notifications, including read-status management.
- Statistics and revenue endpoints.
- Interactive endpoint documentation with Swagger/OpenAPI.

## Tech stack

- Node.js, Express 5, and TypeScript
- Knex.js with PostgreSQL (`pg`)
- JWT and bcryptjs for authentication and password hashing
- Multer for uploads, with Cloudinary as an optional image storage provider
- Nodemailer for password recovery emails
- Swagger UI and `swagger-jsdoc` for API documentation

## API documentation

- [Production Swagger documentation](https://my-delivery-server-nine.vercel.app/api-docs/)
- Local server: `http://localhost:3003/api-docs/`

The root path `/` redirects to the API documentation.

## Run locally

Requires Node.js, npm, and access to a PostgreSQL instance. From this project directory:

```bash
npm install
```

Create a `.env` file in the project root and configure the database connection and application settings:

```env
PORT=3003
NODE_ENV=development
MYDELIVERY_DB=postgresql://user:password@localhost:5432/mydelivery
JWT_KEY=your_local_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
UPLOAD_DRIVER=local
```

`ALLOWED_ORIGINS` accepts a comma-separated list of origins. `UPLOAD_DRIVER` must be set to `local` or `cloudinary`. To use Cloudinary, also configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

The password recovery service uses `ETHEREAL_USER` and `ETHEREAL_PASSWORD`, along with `CUSTOMER_CLIENT_URL` and `PROVIDER_CLIENT_URL` to build the links sent to the apps.

To create any missing tables in the configured database, run:

```bash
npm run migrations
```

Start the development server:

```bash
npm run dev
```

Additional command:

```bash
npm start
```

`npm start` compiles the TypeScript and starts the application. During development, `npm run dev` runs the TypeScript entry point with Nodemon.

## Related applications

- [My Delivery — customer app](https://my-delivery-silk.vercel.app)
- [My Delivery Provider — store dashboard](https://my-delivery-provider.vercel.app)
- [SaaS Dashboard](https://dashboard-project-nu-one.vercel.app/)
- [Portfolio](https://portfolio-vtu0.onrender.com)
