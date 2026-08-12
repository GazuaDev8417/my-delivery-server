import ConnectToDatabase from "../data/Connexion"
import CustomerNotificationData from "../data/CustomerNotificationData"


export default class Restaurant extends ConnectToDatabase{
    protected RESTAURANT_TABLE = 'restaurants'

    constructor(
        private address:string,
        private phone:string,
        private description:string,
        private id:string,
        private logourl:string,
        private name:string,
        private email:string,
        private password:string,
        private role:string
    ){ super() }

    save = async():Promise<void>=>{
        try{
            await ConnectToDatabase.con(this.RESTAURANT_TABLE).insert({
                address: this.address,
                phone: this.phone,
                description: this.description,
                id: this.id,
                logourl: this.logourl,
                name: this.name,
                email: this.email,
                password: this.password,
                role: this.role
            })

            await new CustomerNotificationData().saveCustomerNofitication(
                `${this.name} is now on My Delivery!`
            )
        }catch(e:any){
            throw new Error(`Failed to save restaurant: ${e.message} || e`)
        }
    }
}