import { app } from "./app"
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { userRouter } from "./routes/userRouter"
import { restaurantRouter } from "./routes/restaurantRouter"
import { orderRouter } from "./routes/orderRouter"
import { statisticsRouter } from "./routes/statisticsRouter"
import { categoryRouter } from "./routes/CategoryRoutes"
import { notificationRouter } from "./routes/NotificationRoutes"
import { customerNotificationRouter } from "./routes/customerNotificationRoutes"
import { providerNotificationRouter } from "./routes/providerNotificationRoutes"


// Swagger UI route setup
const SWAGGER_VERSION = "5.11.0"
const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${SWAGGER_VERSION}`

const swaggerUiOptions:swaggerUi.SwaggerUiOptions = {
    customCssUrl: `${CDN_BASE}/swagger-ui.min.css`,
    customJs: [
        `${CDN_BASE}/swagger-ui-bundle.min.js`,
        `${CDN_BASE}/swagger-ui-standalone-preset.min.js`,
    ],
    customSiteTitle: 'My Delivery API Documentation',
    customCss: `
        body, .swagger-ui {
            background-color: #1b1b1b !important;
            color: #ffffff !important;
        }
        .swagger-ui .topbar {
            display: none !important;
        }
        .swagger-ui .scheme-container {
            background-color: #1b1b1b !important;
            box-shadow: none !important;
        }

        /* Headers & Tag Titles */
        .swagger-ui .info .title, 
        .swagger-ui .info p, 
        .swagger-ui .info a,
        .swagger-ui .opblock-tag {
            color: #ffffff !important;
        }

        /* --- ROUTE PATHS & DESCRIPTIONS FIX --- */
        /* Route Path (e.g., /users/signup) */
        .swagger-ui .opblock .opblock-summary-path,
        .swagger-ui .opblock .opblock-summary-path__deprecated {
            color: #ffffff !important;
            font-weight: 600 !important;
        }

        /* Route Summary/Description text */
        .swagger-ui .opblock .opblock-summary-description {
            color: #d1d5db !important; /* Soft bright gray for contrast */
        }

        /* Lock icon & arrow collapse icons */
        .swagger-ui .opblock .authorization__btn svg,
        .swagger-ui .opblock .arrow svg {
            fill: #ffffff !important;
        }
    `
}

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions))

app.get('/', (req, res) => {
    res.redirect('/api-docs')
})


app.use('/users', userRouter)
app.use('/providers', restaurantRouter)
app.use('/orders', orderRouter)
app.use('/statistics', statisticsRouter)
app.use('/categories', categoryRouter)
app.use('/notifications', notificationRouter)
app.use('/customers-notifications', customerNotificationRouter)
app.use('/provider-notifications', providerNotificationRouter)


export default app