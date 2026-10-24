export default class StockConflictError extends Error {
    constructor(){
        super('Product not found or stock is insufficient for the requested quantity')
        this.name = 'StockConflictError'
    }
}
