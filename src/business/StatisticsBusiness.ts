import StatisticsData, { Statistics } from "../data/StatisticsData"
import { AppError } from "../services/Authentication"
import { MonthlyStatistic } from "../data/StatisticsData"



export default class StatisticBusiness{
    constructor(
        private statisticsData:StatisticsData
    ){}


    public getStatistics = async(providerId:string):Promise<Statistics[]>=>{
        const restStatistics = await this.statisticsData.getStatisticsPanel(providerId)
        
        if(restStatistics.length === 0){
            throw new AppError(404, 'There is no data to fetch statistics')
        }

        return restStatistics
    }


    public getMonthlyStatistics = async(providerId:string):Promise<MonthlyStatistic[]>=>{
        const revenueByMonth = await this.statisticsData.getMonthlyStatistics(providerId)
        
        if(revenueByMonth.length === 0){
            throw new AppError(401, 'There is no data to fetch statistics by month')
        }

        return revenueByMonth
    }
}