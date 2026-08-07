import CategoriesData, { Categories } from "../data/CategoriesData"
import { AppError } from "../services/Authentication"



export default class CategoriesBusiness{
    constructor(
        private categoriesData:CategoriesData
    ){}


    public findCategoryStatistics = async(providerId:string):Promise<Categories[]>=>{
        const categories = await this.categoriesData.getCategoryStatistics(providerId)
        
        if(categories.length === 0){
            throw new AppError(404, 'There is no data to fetch statistics')
        }

        return categories
    }

}