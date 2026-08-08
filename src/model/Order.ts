import ConnectToDatabase from "../data/Connexion"
import NotificationData from "../data/NotificationData"
import { v4 as uuidv4 } from 'uuid'



export default class Order extends ConnectToDatabase{
    protected ORDERS_TABLE = 'orders'

    constructor(
        private id:string,
        private product:string,
        private price:number,
        private photoUrl:string,
        private quantity:number,
        private total:number,
        private moment:Date,
        private client:string,
        private state:string,
        private address:string,
        private description:string,
        private provider:string
    ){ super() }

    save = async():Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.ORDERS_TABLE).insert({
                id: this.id,
                product: this.product ,
                price: this.price,
                photoUrl: this.photoUrl,
                quantity: this.quantity,
                total: this.total,
                moment: this.moment,
                client: this.client,
                state: this.state,
                address: this.address,
                description: this.description,
                provider: this.provider
            })

            await new NotificationData().saveNofitication(
                this.provider,
                `New order placed for ${this.product}`
            )
        }catch(e:any){
            throw new Error(`Failed to save order: ${e.message || e}`)
        }
    }
}