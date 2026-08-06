import ConnectToDatabase from "./Connexion"

export interface Statistics{
  title:string
  value:string
}


export default class StatisticsData extends ConnectToDatabase{
    protected USER_TABLE = 'users'
    protected ORDER_TABLE = 'orders'
    protected PRODUCT_TABLE = 'products'


    public getStatisticsPanel = async():Promise<Statistics[]>=>{
        try{
            const [
                [{ count: totalCustomers }],
                [{ count: totalOrder }],
                [{ count: totalProducts }],
                [{ sum: totalRevenue }]
            ] = await Promise.all([
                ConnectToDatabase.con(this.USER_TABLE).count('id as count'),
                ConnectToDatabase.con(this.ORDER_TABLE).count('id as count'),
                ConnectToDatabase.con(this.PRODUCT_TABLE).count('id as count'),
                ConnectToDatabase.con(this.ORDER_TABLE).sum('total as sum')
            ])
            return [
                {title: 'Revenue', value: totalRevenue || 0},
                {title: 'Customer', value: totalCustomers},
                {title: 'Orders', value: totalOrder},
                {title: 'Products', value: totalProducts},
            ]
        }catch(e:any){
            throw new Error(`Failed to get statistics: ${e.message || e}`)
        }
    }
}
