import ConnectToDatabase from "./Connexion"
import { v4 as uuidv4 } from 'uuid'
import Restaurant from "../model/Restaurant"
import Product from "../model/Products"
import SecondayDBProduct from "../model/SecondaryDBProducts"
import { ProductModel, RestaurantModel } from "../model/typesAndInterfaces"



export default class RestaurantData extends ConnectToDatabase{
    protected RESTAURANT_TABLE = 'restaurants'
    protected PRODUCT_TABLE = 'products'
    protected RESET_PASSWORD_TABLE = 'reset_password'
    protected SECONDARY_DB_PRODUCT = 'Product'


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
        address: string, 
        phone: string
    ): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.RESTAURANT_TABLE)
                .update({ name, address, phone })
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to update restaurant data: ${error.message || error}`)
        }
    }


    public saveResetToken = async (restaurant_id: string, token: string): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.RESET_PASSWORD_TABLE)
                .insert({
                    id: uuidv4(),
                    restaurant_id,
                    token: token,
                    expires_at: new Date(Date.now() + 15 * 60 * 1000)
                })
        } catch (error: any) {
            throw new Error(`Failed to save reset token: ${error.message || error}`)
        }
    }


    public updatePassword = async (id: string, newPasswordHash: string): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.RESTAURANT_TABLE)
                .update({ password: newPasswordHash })
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to update password: ${error.message || error}`)
        }
    }


    public clearResetToken = async (id: string): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.RESET_PASSWORD_TABLE)
                .del()
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to clear reset token: ${error.message || error}`)
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


    public insertSecondaryDBProduct = async(secondaryDBProduct:SecondayDBProduct):Promise<void>=>{
        try{
            
            await secondaryDBProduct.save()

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


    public findProduct = async(name:string, category:string, description:string):Promise<ProductModel | undefined>=>{
        try{

            const [product] = await ConnectToDatabase.con(this.PRODUCT_TABLE).where({
                name,
                category,
                description
            })

            return product
        }catch(e:any){
            throw new Error(`Error fetching product by name: ${e.message || e}`)
        }
    }


    public findSecondaryDBProduct = async(name:string, category:string, description:string):Promise<ProductModel | undefined>=>{
        try{

            const [product] = await ConnectToDatabase.con(this.PRODUCT_TABLE).where({
                name,
                category,
                description
            })

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


    public deleteProductBySomeFields = async(name:string, category:string, description:string):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.PRODUCT_TABLE).where({
                name,
                category,
                description
            }).del()

        }catch(e:any){
            throw new Error(`Error deleting product: ${e.message || e}`)
        }
    }


    public deleteSecProductBySomeFields = async(name:string, category:string, description:string):Promise<void>=>{
        try{

            await ConnectToDatabase.con(this.SECONDARY_DB_PRODUCT).where({
                name,
                category,
                description
            }).del()

        }catch(e:any){
            throw new Error(`Error deleting product: ${e.message || e}`)
        }
    }
}