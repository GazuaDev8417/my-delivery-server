import ConnectToDatabase from "./Connexion"



export default class DatabaseManager extends ConnectToDatabase{
    static USER_TABLE = 'users'
    static RESTAURANT_TABLE = 'restaurants'
    static PRODUCT_TABLE = 'products'
    static ORDER_TABLE = 'orders'
    static RESET_PASSWORD_TABLE = 'reset_password'
    static PROVIDER_NOTIFICATION_MATRIX_TABLE = 'matrix_provider_notifications'
    static PROVIDER_NOTIFICATION_TABLE = 'provider_notifications'
    static USERS_NOTIFICATION_MATRIX_TABLE = 'matrix_customer_notifications'
    static USERS_NOTIFICATION_TABLE = 'customer_notifications'


    public static async createUsersTable():Promise<void>{
        try{
            const exists = await this.con.schema.hasTable(this.USER_TABLE)
            if(!exists){
                await this.con.schema.createTable(this.USER_TABLE, (table)=>{
                    table.string('id', 36).primary().notNullable()
                    table.string('username', 50).notNullable()
                    table.string('email', 150).notNullable()
                    table.string('phone', 15).notNullable()
                    table.string('password', 255).notNullable()
                    table.string('street', 150)
                    table.string('cep', 10)
                    table.string('number', 4)
                    table.string('neighbourhood', 30)
                    table.string('city', 30)
                    table.string('state', 30)
                    table.string('complement', 150)
                })

                console.log(`${this.USER_TABLE} table was created successfully`)
            }else{
                console.log(`${this.USER_TABLE} table already exists!`)
            }
        }catch(e){
            console.log(`Error creating ${this.USER_TABLE} table: ${e}`)
        }
    }


    public static async createResetPasswordTable():Promise<void>{
        try{
            const exists = await this.con.schema.hasTable(this.RESET_PASSWORD_TABLE)

            if(!exists){
                await this.con.schema.createTable(this.RESET_PASSWORD_TABLE, (table)=>{
                    table.string('id', 36).primary().notNullable()
                    table.string('user_id', 36).notNullable().references('id').inTable(this.USER_TABLE).onDelete('CASCADE')
                    table.string('restaurant_id', 36).notNullable().references('id').inTable(this.RESTAURANT_TABLE).onDelete('CASCADE')
                    table.string('token').notNullable()
                    table.timestamp('expires_at').notNullable()
                    table.boolean('used').defaultTo(false).notNullable()
                    table.timestamps(true, true)
                })

                console.log(`${this.RESET_PASSWORD_TABLE} table was created successfully`)
            }else{
                console.log(`${this.RESET_PASSWORD_TABLE} table already exists!`)
            }
        }catch(e){
            console.log(`Error creating ${this.RESET_PASSWORD_TABLE} table: ${e}`)
        }
    }


    public static async createRestaurantsTable():Promise<void>{
        try{
            const exists = await this.con.schema.hasTable(this.RESTAURANT_TABLE)
            if(!exists){
                await this.con.schema.createTable(this.RESTAURANT_TABLE, (table)=>{
                    table.string('address', 150).notNullable()
                    table.string('phone', 15).notNullable()
                    table.string('description', 100).notNullable()
                    table.string('id', 36).primary().notNullable()
                    table.string('logourl', 255)
                    table.string('name', 30).notNullable()
                    table.string('password', 255).notNullable()
                    table.string('email', 150).notNullable()
                    table.string('role', 30).defaultTo('Administrator').notNullable()
                })

                console.log(`${this.RESTAURANT_TABLE} table was created successfully`)
            }else{
                console.log(`${this.RESTAURANT_TABLE} table already exists!`)
            }
        }catch(e){
            console.log(`Error creating ${this.RESTAURANT_TABLE} table: ${e}`)
        }
    }


    public static async createProductsTable():Promise<void>{
        try{
            const exists = await this.con.schema.hasTable(this.PRODUCT_TABLE)
            if(!exists){
                await this.con.schema.createTable(this.PRODUCT_TABLE, (table)=>{
                    table.string('category', 50).notNullable()
                    table.text('description').notNullable()
                    table.string('id', 36).primary().notNullable()
                    table.string('name', 50).notNullable()
                    table.string('photoUrl', 255)
                    table.decimal('price', 10, 2).notNullable()
                    table.integer('stock').notNullable()
                    table.string('provider', 255).notNullable()
                    table.string('status', 20).notNullable()
                })

                console.log(`${this.PRODUCT_TABLE} table was created successfully`)
            }else{
                console.log(`${this.PRODUCT_TABLE} table already exists!`)
            }
        }catch(e){
            console.log(`Erro creating ${this.PRODUCT_TABLE} table: ${e}`)
        }
    }


    public static async createOrdersTable():Promise<void>{
        try{
            const exists = await this.con.schema.hasTable(this.ORDER_TABLE)
            if(!exists){
                await this.con.schema.createTable(this.ORDER_TABLE, (table)=>{
                    table.string('id', 36).primary().notNullable()
                    table.string('product', 50).notNullable()
                    table.decimal('price', 10, 2).notNullable()
                    table.string('photoUrl', 255)
                    table.integer('quantity').notNullable()
                    table.decimal('total', 10, 2).notNullable()
                    table.timestamp('moment').notNullable()
                    table.string('client', 255).notNullable()
                    table.string('state', 50).notNullable()
                    table.string('address', 255).notNullable()
                    table.text('description').notNullable()
                    table.string('payment', 10)
                    table.string('provider', 255).notNullable()
                })

                console.log(`${this.ORDER_TABLE} table was created successfully`)
            }else{
                console.log(`${this.ORDER_TABLE} table already exists!`)
            }
        }catch(e){
            console.log(`Error creating ${this.ORDER_TABLE} table: ${e}`)
        }
    }
//================== NOTIFICATION TABLES ==================================
    //================ PROVIDER ==============================
    public static async createMatrixProviderNotificationsTable(): Promise<void> {
        try {
            const exists = await this.con.schema.hasTable(this.PROVIDER_NOTIFICATION_MATRIX_TABLE)
            if (!exists) {
                await this.con.schema.createTable(this.PROVIDER_NOTIFICATION_MATRIX_TABLE, (table) => {
                    table.string('id', 36).primary().notNullable()
                    table.string('notification', 255).notNullable()
                    table.timestamp('created_at').defaultTo(this.con.fn.now()).notNullable()
                })

                console.log(`${this.PROVIDER_NOTIFICATION_MATRIX_TABLE} table was created successfully`)
            } else {
                console.log(`${this.PROVIDER_NOTIFICATION_MATRIX_TABLE} table already exists!`)
            }
        } catch (e) {
            console.log(`Error creating notifications table: ${e}`)
        }
    }

    public static async createProviderNotificationsTable(): Promise<void> {
        try {
            const exists = await this.con.schema.hasTable(this.PROVIDER_NOTIFICATION_TABLE)
            if (!exists) {
                await this.con.schema.createTable(this.PROVIDER_NOTIFICATION_TABLE, (table) => {
                    table.string('id', 36).primary().notNullable()
                    table.string('notification_id', 36).notNullable()
                    table.string('user_id', 255).notNullable().notNullable()
                    table.boolean('is_read').defaultTo(false).notNullable()
                    table.timestamp('created_at').defaultTo(this.con.fn.now()).notNullable()
                })

                console.log(`${this.PROVIDER_NOTIFICATION_TABLE} table was created successfully`)
            } else {
                console.log(`${this.PROVIDER_NOTIFICATION_TABLE} table already exists!`)
            }
        } catch (e) {
            console.log(`Error creating notifications table: ${e}`)
        }
    }

    //====================== CUSTOMER ==================================
    public static async createCustomerNotificationsMatrixTable(): Promise<void> {
        try {
            const exists = await this.con.schema.hasTable(this.USERS_NOTIFICATION_MATRIX_TABLE)
            if (!exists) {
                await this.con.schema.createTable(this.USERS_NOTIFICATION_MATRIX_TABLE, (table) => {
                    table.string('id', 36).primary().notNullable()
                    table.string('notification', 255).notNullable()
                    table.timestamp('created_at').defaultTo(this.con.fn.now()).notNullable()
                })

                console.log(`${this.USERS_NOTIFICATION_MATRIX_TABLE} table was created successfully`)
            } else {
                console.log(`${this.USERS_NOTIFICATION_MATRIX_TABLE} table already exists!`)
            }
        } catch (e) {
            console.log(`Error creating notifications table: ${e}`)
        }
    }

    public static async createCustomerNotificationsTable(): Promise<void> {
        try {
            const exists = await this.con.schema.hasTable(this.USERS_NOTIFICATION_TABLE)
            if (!exists) {
                await this.con.schema.createTable(this.USERS_NOTIFICATION_TABLE, (table) => {
                    table.string('id', 36).primary().notNullable()
                    table.string('notification_id', 36).notNullable()
                    table.string('customer_id', 255).notNullable()
                    table.boolean('is_read').defaultTo(false).notNullable()
                    table.timestamp('created_at').defaultTo(this.con.fn.now()).notNullable()
                })

                console.log(`${this.USERS_NOTIFICATION_TABLE} table was created successfully`)
            } else {
                console.log(`${this.USERS_NOTIFICATION_TABLE} table already exists!`)
            }
        } catch (e) {
            console.log(`Error creating notifications table: ${e}`)
        }
    }


    public static async closeConnexion():Promise<void>{
        await this.con.destroy()
        console.log('Database connection closed.')
    }
}


(async()=>{
    await DatabaseManager.createUsersTable()
    await DatabaseManager.createRestaurantsTable()
    await DatabaseManager.createProductsTable()
    await DatabaseManager.createOrdersTable()
    await DatabaseManager.createResetPasswordTable()
    await DatabaseManager.createMatrixProviderNotificationsTable()
    await DatabaseManager.createProviderNotificationsTable()
    await DatabaseManager.createCustomerNotificationsMatrixTable()
    await DatabaseManager.createCustomerNotificationsTable()
    await DatabaseManager.closeConnexion()
})()
