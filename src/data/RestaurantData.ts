import ConnectToDatabase from "./Connexion"
import Restaurant from "../model/Restaurant"
import Product from "../model/Products"
import { ProductModel, RestaurantModel } from "../model/typesAndInterfaces"



export default class RestaurantData extends ConnectToDatabase{
    protected RESTAURANT_TABLE = 'restaurants'
    protected PRODUCT_TABLE = 'products'


    public createRestaurant = async (restaurant: Restaurant): Promise<void> => {
        try {
            await restaurant.save()
        } catch (error: any) {
            throw new Error(`Error registering restaurant: ${error.message || error}`)
        }
    }


    public getRestaurant = async():Promise<RestaurantModel>=>{
        try{

            const [restaurant] = await ConnectToDatabase.con(this.RESTAURANT_TABLE).select(
                'address', 'phone', 'category', 'id', 'logourl', 'name', 'email'
            )

            return restaurant
        }catch(e:any){
            throw new Error(`Error fetching restaurant: ${e.message || e}`)
        }
    }


    public findRestaurantById = async(id:string):Promise<RestaurantModel>=>{
        try{

            const [restaurant] = await ConnectToDatabase.con(this.RESTAURANT_TABLE)
            .select('address', 'phone', 'category', 'id', 'logourl', 'name', 'email')
            .where({ id })

            return restaurant
        }catch(e:any){
            throw new Error(`Error fetching restaurant by ID: ${e.message || e}`)
        }
    }


    findRestaurantByEmail = async(email:string):Promise<RestaurantModel>=>{
        try{

            const [restaurant] = await ConnectToDatabase.con(this.RESTAURANT_TABLE).where({ email })

            return restaurant
        }catch(e:any){
            throw new Error(`Error fetching restaurant by email: ${e.message || e}`)
        }
    }


    public updateRestaurant = async (
        id: string, 
        name: string, 
        email: string, 
        address: string, 
        phone: string
    ): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.RESTAURANT_TABLE)
                .update({ name, email, address, phone })
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to update restaurant data: ${error.message || error}`)
        }
    }

// ======================= PRODUCTS ========================

    public insertProduct = async(product:Product):Promise<void>=>{
        try{

            await product.save()

        }catch(e:any){
            throw new Error(`Error inserting product: ${e.message || e}`)
        }
    }


    public updateProduct = async(
        id:string, 
        category:string, 
        description:string, 
        name:string, 
        price:number, 
        photoUrl:string
    ):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.PRODUCT_TABLE).update({
                category, description, name, price, photoUrl
            }).where({ id })
            
        }catch(e:any){
            throw new Error(`Error updating product: ${e.message || e}`)
        }
    }


    public findProductByName = async(name:string):Promise<ProductModel | undefined>=>{
        try{

            const [product] = await ConnectToDatabase.con(this.PRODUCT_TABLE).where({ name })

            return product
        }catch(e:any){
            throw new Error(`Error fetching product by name: ${e.message || e}`)
        }
    }


    public findAllProducts = async():Promise<ProductModel[]>=>{
        try{

            const products = await ConnectToDatabase.con(this.PRODUCT_TABLE)
            
            return products
        }catch(e:any){
            throw new Error(`Error fetching menu products: ${e.message || e}`)
        }
    }


    public findProductById = async(id:string):Promise<ProductModel | undefined>=>{
        try{

            const [product] = await ConnectToDatabase.con(this.PRODUCT_TABLE)
                .where({ id })
            
            return product
        }catch(e:any){
            throw new Error(`Error fetching product by ID: ${e.message | e}`)
        }
    }


    public deleteProduct = async(id:string):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.PRODUCT_TABLE).where({ id }).del()

        }catch(e:any){
            throw new Error(`Error deleting product: ${e.message || e}`)
        }
    }
}