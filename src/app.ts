import express from 'express'
import { config } from 'dotenv'
config()
import cors from 'cors'


 


const PORT = process.env.PORT || 3003
export const app = express()
app.use(express.json())

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

console.log(allowedOrigins)

app.use(cors({
    origin: (origin, callback)=>{
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true)
        }else{
            callback(null, false)
        }
    },
    credentials: true
}))


if(process.env.NODE_ENV !== 'production'){
    app.listen(PORT, ()=>{ 
        console.log(`Server running on http://localhost:${PORT}`)
    })
}


export default app