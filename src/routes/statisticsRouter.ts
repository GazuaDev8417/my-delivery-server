import { Router } from "express"
import StatisticsData from "../data/StatisticsData"
import StatisticBusiness from "../business/StatisticsBusiness"
import StatisticController from "../controller/StatisticsController"


export const statisticsRouter = Router()


const statisticsData = new StatisticsData()
const statisticsBusiness = new StatisticBusiness(statisticsData)
const statisticController = new StatisticController(statisticsBusiness)


/* ROUTES */
statisticsRouter.get('/revenue', statisticController.getStatistics)

