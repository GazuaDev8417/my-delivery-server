import ConnectToDatabase from "./Connexion"


export interface Categories{
    name:string
    value:number
}


export default class CategoriesData extends ConnectToDatabase{
    protected ORDER_TABLE = 'orders'
    protected PRODUCT_TABLE = 'products'


    public getCategoryStatistics = async(providerId:string):Promise<Categories[]>=>{
        const orderTable = this.ORDER_TABLE
        const productTable = this.PRODUCT_TABLE
        try{
            const result = await ConnectToDatabase.con(this.ORDER_TABLE)
                .innerJoin(
                    productTable,
                    function(){
                        this.on(`${orderTable}.provider`, '=', `${productTable}.provider`)
                            .andOn(`${orderTable}.description`, '=', `${productTable}.description`)
                    }
                )
                .where(`${orderTable}.provider`, providerId)
                .select(`${productTable}.category as name`)
                .sum(`${orderTable}.total as value`)
                .groupBy(`${productTable}.category`)

            return result.map((row:any)=>({
                name: row.name,
                value: Number(row.value)
            }))
        }catch(e:any){
            throw new Error(`Failed to fetch statistics of categories: ${e.message || e}`)
        }
    }
}