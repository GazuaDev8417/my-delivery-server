import { app } from "./app"
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { userRouter } from "./routes/userRouter"
import { restaurantRouter } from "./routes/restaurantRouter"
import { orderRouter } from "./routes/orderRouter"
import { statisticsRouter } from "./routes/statisticsRouter"
import { categoryRouter } from "./routes/CategoryRoutes"
import { notificationRouter } from "./routes/NotificationRoutes"


// Swagger UI route setup
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css"
const JS_URLS = [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js"
]

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCssUrl: CSS_URL,
    customJs: JS_URLS,
    customSiteTitle: 'My Delivery API Documentation',
}))

app.get('/', (req, res) => {
    res.redirect('/api-docs')
})


app.use('/users', userRouter)
app.use('/restaurants', restaurantRouter)
app.use('/orders', orderRouter)
app.use('/statistics', statisticsRouter)
app.use('/categories', categoryRouter)
app.use('/notifications', notificationRouter)

export default app