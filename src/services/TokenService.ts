import jwt from 'jsonwebtoken'
import { config } from 'dotenv'

config()



export default class TokenService{
    private jwtKey:string

    constructor(){
        this.jwtKey = process.env.JWT_KEY as string
    }
    public generateToken = (payload:string):string=>{
        return jwt.sign(
            { payload },
            this.jwtKey
        )
    }

    public generateRestaurantToken = (payload:string):string=>{
        return jwt.sign(
            { payload },
            this.jwtKey,
            { expiresIn: '24h' }
        )
    }

    public generateResetToken = (payload:string):string=>{
        return jwt.sign(
            { payload },
            this.jwtKey,
            { expiresIn: '15m' }
        )
    }
}