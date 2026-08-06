import knex from 'knex'
import { config } from 'dotenv'

config()


export default abstract class ConnectToDatabase{
    protected static con = knex({
        client: 'pg',
        connection: process.env.MYDELIVERY_DB        
    })

    // protected static con = knex({
    //     client: 'mysql2',
    //     connection: {
    //         host: 'localhost',
    //         user: 'gazua',
    //         password: 'alfadb',
    //         database: 'delivery_db'
    //     }
    // })

    
    public static testMyDeliveryConnexion = async():Promise<void>=>{
        try{
            await this.con.raw('SELECT 1+1 AS result')
            console.log('Connected to My Delivery database')
        }catch(e){
            console.log(`Failed to connect to My Delivery database ${e}`)
        }
    }

    // public static testLocalConnexion = async():Promise<void>=>{
    //     try{
    //         await this.con.raw('SELECT 1+1 AS result')
    //         console.log('Connected to localhost database')
    //     }catch(e){
    //         console.log(`Failed to connect to localhost database ${e}`)
    //     }
    // }
}


(async()=>{
    await ConnectToDatabase.testMyDeliveryConnexion()
    //await ConnectToDatabase.testLocalConnexion()
})()


