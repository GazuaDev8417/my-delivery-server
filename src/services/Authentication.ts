import { Request } from 'express'
import { randomUUID } from 'crypto'
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

export type AuthenticatedActor = {
    id: string;
    role: 'USER' | 'RESTAURANT';
}


export class AppError extends Error{
    constructor(public statusCode: number, message: string){
        super(message)
        Object.setPrototypeOf(this, AppError.prototype)
    }
}


export default class Services{
    private userData:UserData
    private restaurantData:RestaurantData

    constructor(){
        this.userData = new UserData()
        this.restaurantData = new RestaurantData()
    }


    public idGenerator = ():string=>{
        return randomUUID()
    }

    public getTokenData = (token:string):TokenData=>{
        try{
            return jwt.verify(
                token,
                process.env.JWT_KEY as string
            ) as TokenData
        }catch(error){
            throw new AppError(401, "Invalid or expired token")
        }
    }

    public hashPassword = (txt:string):string=>{
        const saltRounds = 12
        const salt = bcrypt.genSaltSync(saltRounds)

        return bcrypt.hashSync(txt, salt)
    }

    public comparePassword = (txt:string, hash:string):boolean=>{
        return bcrypt.compareSync(txt, hash)
    }

    public authenticateActor = async (req: Request): Promise<AuthenticatedActor> => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            throw new AppError(401, "Authorization header is missing");
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const tokenData = this.getTokenData(token);

        const user = await this.userData.getProfile(tokenData.payload);
        if (user) {
            return { id: user.id, role: 'USER' };
        }

        const restaurant = await this.restaurantData.findRestaurantById(tokenData.payload);
        if (restaurant) {
            return { id: restaurant.id, role: 'RESTAURANT' };
        }

        throw new AppError(401, "Invalid or unauthorized token");
    }

    public authenticateUser = async(req:Request):Promise<UserModel>=>{
        const authHeader = req.headers.authorization
        if (!authHeader) {
            throw new AppError(401, "Authorization header is missing");
        }


        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader
        const tokenData =  this.getTokenData(token)
        const user = await this.userData.getProfile(tokenData.payload)

        if(!user){
            throw new AppError(404, 'User not found')
        }

        return user
    }

    public authenticateRestaurant = async(req:Request):Promise<RestaurantModel>=>{
        const authHeader = req.headers.authorization
        
        if(!authHeader){
            throw new AppError(401, 'Authorization header is missing')
        }
        
        
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader
        const tokenData =  this.getTokenData(token)
        const restaurant = await this.restaurantData.findRestaurantById(tokenData.payload)
    
        if(!restaurant){
            throw new AppError(404, 'Restaurant not found')
        }
    
        return restaurant
    }
    
}