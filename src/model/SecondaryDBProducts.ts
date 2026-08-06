import ConnectToDatabase from "../data/Connexion"



export default class SecondaryDBProduct extends ConnectToDatabase{
    protected SECONDARY_DB_PRODUCT = 'product'

    constructor(
        private name:string,
        private description:string,
        private category:string,
        private price:number,
        private stock:number,
        private status:string
    ){ super() }

    save = async():Promise<void>=>{ 
        try{
            const result = await ConnectToDatabase.dbSecondary(this.SECONDARY_DB_PRODUCT).insert({
                name: this.name,
                description: this.description,
                category: this.category,
                price: this.price,
                stock: this.stock,
                status: this.stock >= 150 ? 'Active' : this.stock > 0 ? 'Low Stock' : 'Inactive'
            })
        }catch(e:any){
            throw new Error(`Failed to save product: ${e.message || e}`)
        }
    }
}