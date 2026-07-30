import knex from 'knex'
import { config } from 'dotenv'

config()


export default abstract class ConnectToDatabase{
    protected static con = knex({
        client: 'pg',
        connection: process.env.MYDELIVERY_DB
    })

    protected static dbSecondary = knex({
        client: 'pg',
        connection: process.env.DASHBOARD_DB        
    })

    
    public static testMyDeliveryConnexion = async():Promise<void>=>{
        try{
            await this.con.raw('SELECT 1+1 AS result')
            console.log('Connected to My Delivery database')
        }catch(e){
            console.log(`Failed to connect to My Delivery database ${e}`)
        }
    }

    public static testMyDashboardConnexion = async():Promise<void>=>{
        try{
            await this.con.raw('SELECT 1+1 AS result')
            console.log('Connected to Dashboard database')
        }catch(e){
            console.log(`Failed to connect to Dashboard database ${e}`)
        }
    }
}


(async()=>{
    await ConnectToDatabase.testMyDeliveryConnexion()
    await ConnectToDatabase.testMyDashboardConnexion()
})()


