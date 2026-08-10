import express from 'express'
import { config } from 'dotenv'
config()
import cors from 'cors'


 


const PORT = process.env.PORT || 3003
export const app = express()
app.use(express.json())

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

console.log('Allowed origins:', allowedOrigins)
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS)

app.use(cors({
    origin: (origin, callback)=>{

        console.log('Request origin', origin)
        console.log('Origin allowed', !origin || allowedOrigins.includes(origin))

        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error('Not permitted by cors policy'))
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