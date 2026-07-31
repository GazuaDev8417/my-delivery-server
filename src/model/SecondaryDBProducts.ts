import ConnectToDatabase from "../data/Connexion"



export default class SecondaryDBProduct extends ConnectToDatabase{
    protected SECONDARY_DB_PRODUCT = 'Product'

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
            console.log('Trying to execute')
            const result = await ConnectToDatabase.dbSecondary(this.SECONDARY_DB_PRODUCT).insert({
                name: this.name,
                description: this.description,
                category: this.category,
                price: this.price,
                stock: this.stock,
                status: this.status
            })

            console.log('the result', result)
        }catch(e:any){
            throw new Error(`Failed to save product: ${e.message || e}`)
        }
    }
}