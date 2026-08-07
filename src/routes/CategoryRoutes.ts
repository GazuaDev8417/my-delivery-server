import { Router } from "express"
import CategoryController from "../controller/CategoriesController"
import CategoriesBusiness from "../business/CategoriesBusiness"
import CategoriesData from "../data/CategoriesData"


export const categoryRouter = Router()

const categoryData = new CategoriesData()
const categoryBusiness = new CategoriesBusiness(categoryData)
const categoryController = new CategoryController(categoryBusiness)


categoryRouter.get('/', categoryController.findCategoryStatistics)
