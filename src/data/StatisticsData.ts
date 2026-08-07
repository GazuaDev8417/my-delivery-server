import ConnectToDatabase from "./Connexion"

export interface Statistics{
  title:string
  value:string
}


export interface MonthlyStatistic{
    month:string
    revenue:number
    orders:number
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


    public getMonthlyStatistics = async(providerId:string):Promise<MonthlyStatistic[]>=>{
        try{
            const orders = await ConnectToDatabase.con(this.ORDER_TABLE)
                .where('provider', providerId)
                .select('total', 'moment')
            
            const monthlyMap: { [key:string] : { revenue:number, orders:number } } = {}
            
            for(const order of orders){
                const momentValue = order.moment
                if(!momentValue) continue

                const date = new Date(momentValue)
                if(isNaN(date.getTime())) continue

                const year = date.getUTCFullYear()
                const month = String(date.getUTCMonth() + 1).padStart(2, '0')
                const key = `${year}-${month}`    
                
                if(!monthlyMap[key]){
                    monthlyMap[key] = { revenue: 0, orders: 0 }
                }

                monthlyMap[key].revenue += Number(order.total) || 0
                monthlyMap[key].orders += 1
            } 

            const result:MonthlyStatistic[] = Object.keys(monthlyMap).map(key=>{
                const [year, month] = key.split('-')
                return {
                    month: `${month}/${year}`,
                    revenue: monthlyMap[key].revenue,
                    orders: monthlyMap[key].orders
                }
            })

            result.sort((a, b)=>{
                const [monthA, yearA] = a.month.split('/')
                const [monthB, yearB] = b.month.split('/')
                return `${yearA}-${monthA}`.localeCompare(`${yearB}-${monthB}`)
            })

            return result
        }catch(e:any){
            throw new Error(`Failed to get monthly statistics: ${e.message || e}`)
        }
    }
}
