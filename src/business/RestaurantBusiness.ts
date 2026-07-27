import RestaurantData from "../data/RestaurantData"
import Restaurant from "../model/Restaurant"
import Product from "../model/Products"
import Services, { AppError } from "../services/Authentication"
import TokenService from "../services/TokenService"
import { ProductModel, RestaurantModel } from "../model/typesAndInterfaces"



export interface SignupRestaurantDTO{
    name:string
    address:string
    phone:string
    email:string
    logourl:string
    password:string
    category:string
}

export interface UpdateRestaurantDTO{
    name:string
    email:string
    phone:string
    address:string
}

export interface LoginDTO{
    email?:string
    password?:string
}

export interface CreateAndUpdateProductDTO{
    category:string
    description:string
    name:string
    price:number
    image:string
}




export default class RestaurantBusiness{
    private readonly EMAIL_REGEX = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    private readonly PHONE_REGEX = /^(\d{2})9\d{8}$/;


    constructor(
        private restaurantData:RestaurantData,
        private services:Services,
        private tokenService:TokenService
    ){}

    
    public signupRestaurant = async(signupDTO:SignupRestaurantDTO):Promise<string>=>{
        const { name, address , phone, email, logourl, password, category } = signupDTO

        if (!name || !address || !phone || !email || !password || !category) {
            throw new AppError(400, "Missing required registration fields")
        }

        const existingRestaurant = await this.restaurantData.findRestaurantByEmail(email)
        if(existingRestaurant){
            throw new AppError(409, `'${existingRestaurant.name}' is already registered`)
        }
        
        
        const id = this.services.idGenerator()
        const token = this.tokenService.generateToken(id)
        const hashedPassword = this.services.hashPassword(password)

        const restaurant = new Restaurant(
            address, 
            phone,
            category, 
            id, 
            logourl, 
            name,
            email,
            hashedPassword
        )
        
        await this.restaurantData.createRestaurant(restaurant)

        return token
    }


    public loginRestaurant = async(loginDTO:LoginDTO):Promise<string>=>{
        const { email, password } = loginDTO
        
        if (!email || !password) {
            throw new AppError(400, "Please provide both email and password to log in")
        }

        const restaurant = await this.restaurantData.findRestaurantByEmail(email)
        if (!restaurant) {
            throw new AppError(401, "Invalid credentials")
        }

        const isPasswordValid = this.services.comparePassword(password, restaurant.password)
        if (!isPasswordValid) {
            throw new AppError(401, "Invalid credentials")
        }

        return this.tokenService.generateToken(restaurant.id)
    }


    public getRestaurant = async (): Promise<RestaurantModel> => {
        const restaurant = await this.restaurantData.getRestaurant()
        if (!restaurant) {
            throw new AppError(404, "Restaurant not found")
        }

        return restaurant
    }


    public updateRestaurant = async (providerId: string, dto: UpdateRestaurantDTO): Promise<void> => {
        const { name, email, phone, address } = dto

        if (!name || !email || !phone || !address) {
            throw new AppError(400, "Please fill in all required profile fields")
        }

        if (!this.EMAIL_REGEX.test(email)) {
            throw new AppError(400, "Invalid email format")
        }

        await this.restaurantData.updateRestaurant(providerId, name, email, address, phone)
    }


    public getRestaurantById = async (restaurantId: string): Promise<RestaurantModel> => {
        const restaurant = await this.restaurantData.findRestaurantById(restaurantId)
        if (!restaurant) {
            throw new AppError(404, "Restaurant not found")
        }

        return restaurant
    }

// ====================== PRODUCTS =============================== 
    public insertProduct = async (productDTO: CreateAndUpdateProductDTO): Promise<void> => {
        const { category, description, name, price, image } = productDTO

        if (!category || !description || !name || !price) {
            throw new AppError(400, "Please fill in all required product fields")
        }

        const existingProduct = await this.restaurantData.findProductByName(name)
        if (
            existingProduct?.category === category &&
            existingProduct?.name === name &&
            existingProduct?.description === description
        ) {
            throw new AppError(409, `Product '${existingProduct.name}' is already registered`)
        }

        const id = this.services.idGenerator()
        const product = new Product(category, description, id, name, price, image)

        await this.restaurantData.insertProduct(product)
    };


    public updateProduct = async (productId: string, updateDTO: CreateAndUpdateProductDTO): Promise<void> => {
        const existingProduct = await this.restaurantData.findProductById(productId)
        if (!existingProduct) {
            throw new AppError(404, "Product not found")
        }

        const { category, description, name, price, image } = updateDTO

        if (!category || !description || !name || !price) {
            throw new AppError(400, "Please fill in all required product fields")
        }

        const photoUrl = image ? image : existingProduct.photoUrl

        await this.restaurantData.updateProduct(
            productId,
            category,
            description,
            name,
            price,
            photoUrl
        )
    }


    public getAllProducts = async (): Promise<ProductModel[]> => {
        const products = await this.restaurantData.findAllProducts()
        if (products.length === 0) {
            throw new AppError(404, "Menu is empty")
        }

        return products
    }


    public getProductById = async (productId: string): Promise<ProductModel> => {
        const product = await this.restaurantData.findProductById(productId)
        if (!product) {
            throw new AppError(404, "Product not found")
        }

        return product
    }


    public deleteProduct = async (productId: string): Promise<string> => {
        const product = await this.restaurantData.findProductById(productId)
        if (!product) {
            throw new AppError(404, "Product not found")
        }

        await this.restaurantData.deleteProduct(productId)
        return product.name
    }
}


