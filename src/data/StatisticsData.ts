import ConnectToDatabase from "./Connexion"

export interface Statistics{
  title:string
  value:string
}


export default class StatisticsData extends ConnectToDatabase{
    protected USER_TABLE = 'users'
    protected ORDER_TABLE = 'orders'
    protected PRODUCT_TABLE = 'products'


    public getStatisticsPanel = async(providerId:string):Promise<Statistics[]>=>{
        try{
            const [
                [{ count: totalCustomers }],
                [{ count: totalOrder }],
                [{ count: totalProducts }],
                [{ sum: totalRevenue }]
            ] = await Promise.all([
                ConnectToDatabase.con(this.ORDER_TABLE).where('provider', providerId).countDistinct('client as count'),
                ConnectToDatabase.con(this.ORDER_TABLE).where('provider', providerId).count('id as count'),
                ConnectToDatabase.con(this.PRODUCT_TABLE).where('provider', providerId).count('id as count'),
                ConnectToDatabase.con(this.ORDER_TABLE).where('provider', providerId).sum('total as sum')
            ])
            //specify from what provider this revenue comes
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
