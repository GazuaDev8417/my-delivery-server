import { Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import UserData from '../data/UserData'
import RestaurantData from '../data/RestaurantData'
import { RestaurantModel, UserModel } from '../model/typesAndInterfaces'
import { config } from 'dotenv'


config()


type TokenData = {
    payload:string
    iat:number
    exp:number
}


export class AppError extends Error{
    constructor(public statusCode: number, message: string){
        super(message)
        Object.setPrototypeOf(this, AppError.prototype)
    }
}


export default class Services{
    private userdata:UserData
    private restaurantData:RestaurantData

    constructor(){
        this.userdata = new UserData()
        this.restaurantData = new RestaurantData()
    }


    public idGenerator = ():string=>{
        return uuidv4()
    }

    public getTokenData = (token:string):TokenData=>{
        return jwt.verify(
            token,
            process.env.JWT_KEY as string
        ) as TokenData
    }

    public hashPassword = (txt:string):string=>{
        const saltRounds = 12
        const salt = bcrypt.genSaltSync(saltRounds)

        return bcrypt.hashSync(txt, salt)
    }

    public comparePassword = (txt:string, hash:string):boolean=>{
        return bcrypt.compareSync(txt, hash)
    }

    public authenticateUser = async(req:Request):Promise<UserModel>=>{
        const token = req.headers.authorization
        if (!token) {
            throw new AppError(401, "Authorization header is missing");
        }

        const tokenData =  new Services().getTokenData(token)
        const user = await new UserData().getProfile(tokenData.payload)

        if(!user){
            throw new AppError(404, 'User not found')
        }
    
        return user
    }

    public authenticateRestaurant = async(req:Request):Promise<RestaurantModel>=>{
        const token = req.headers.authorization
        
        if(!token){
            throw new AppError(401, 'Authorization header is missing')
        }

        const tokenData =  new Services().getTokenData(token)
        const restaurant = await new RestaurantData().findRestaurantById(tokenData.payload)
        
    
        if(!restaurant){
            throw new AppError(404, 'Restaurant not found')
        }
    
        return restaurant
    }
    
}