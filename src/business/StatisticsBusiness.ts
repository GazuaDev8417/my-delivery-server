import StatisticsData, { Statistics } from "../data/StatisticsData"
import { AppError } from "../services/Authentication"



export default class StatisticBusiness{
    constructor(
        private statisticsData:StatisticsData
    ){}


    public getStatistics = async():Promise<Statistics[]>=>{
        const restStatistics = await this.statisticsData.getStatisticsPanel()
        
        if(restStatistics.length === 0){
            throw new AppError(401, 'There is no data to fetch statistics')
        }

        return restStatistics
    }
}