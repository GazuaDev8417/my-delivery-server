import { app } from "./app"
import { userRouter } from "./routes/userRouter"
import { restaurantRouter } from "./routes/restaurantRouter"
import { orderRouter } from "./routes/orderRouter"
import { statisticsRouter } from "./routes/statisticsRouter"
import { categoryRouter } from "./routes/CategoryRoutes"


app.use('/users', userRouter)
app.use('/restaurants', restaurantRouter)
app.use('/orders', orderRouter)
app.use('/statistics', statisticsRouter)
app.use('/categories', categoryRouter)
