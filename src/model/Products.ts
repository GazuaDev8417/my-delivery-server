import ConnectToDatabase from "../data/Connexion"



export default class Product extends ConnectToDatabase{
    protected PRODUCT_TABLE = 'products'

    constructor(
        private category:string,
        private description:string,
        private id:string,
        private name:string,
        private price:number,
        private photoUrl:string
    ){ super() }

    save = async():Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.PRODUCT_TABLE).insert({
                category: this.category,
                description: this.description,
                id: this.id,
                name: this.name,
                price: this.price,
                photoUrl: this.photoUrl
            })
        }catch(e:any){
            throw new Error(`Failed to save product: ${e.message || e}`)
        }
    }
}