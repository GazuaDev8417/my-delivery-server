import ConnectToDatabase from "../data/Connexion"



export default class Product extends ConnectToDatabase{
    protected PRODUCT_TABLE = 'products'

    constructor(
        private category:string,
        private description:string,
        private id:string,
        private name:string,
        private photoUrl:string,
        private price:number,
        private stock:number,
        private provider:string
    ){ super() }

    save = async():Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.PRODUCT_TABLE).insert({
                category: this.category,
                description: this.description,
                id: this.id,
                name: this.name,
                photoUrl: this.photoUrl,
                price: this.price,
                stock: this.stock,
                provider: this.provider
            })
        }catch(e:any){
            throw new Error(`Failed to save product: ${e.message || e}`)
        }
    }
}