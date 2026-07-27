import knex from 'knex'
import { config } from 'dotenv'

config()


export default abstract class ConnectToDatabase{
    protected static con = knex({
        client: 'pg',
        connection: process.env.MYDELIVERY_DB
    })

    public static testConnexion = async():Promise<void>=>{
        try{

            await this.con.raw('SELECT 1+1 AS result')
            console.log('Connected to database')
        }catch(e){
            console.log(`Failed to connect to database ${e}`)
        }
    }
}


(async()=>{
    await ConnectToDatabase.testConnexion()
})()


