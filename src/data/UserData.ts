import ConnectToDatabase from "./Connexion"
import { v4 as uuidv4 } from 'uuid'
import User from "../model/User"
import { UserModel } from "../model/typesAndInterfaces"



export interface AddressDTO{
    street: string
    cep: string
    number: string
    neighbourhood: string
    city: string
    state: string
    complement?: string
} 



export default class UserData extends ConnectToDatabase{
    protected USER_TABLE = 'users'
    protected ORDER_TABLE = 'orders'
    protected RESET_PASSWORD_TABLE = 'reset_password'
    protected CUSTOMER_TABLE = 'Customer'

//USER FIELD 
    public createUser = async (user: User): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.USER_TABLE).insert({
                id: user.getId(),
                username: user.getUsername(),
                email: user.getEmail(),
                phone: user.getPhone(),
                password: user.getPassword()
            })
        } catch (error: any) {
            throw new Error(`Failed to create primary database user: ${error.message || error}`)
        }
    }

    
    public createSecondaryDBUser = async (user: User): Promise<void> => {
        try {
            await ConnectToDatabase.dbSecondary(this.CUSTOMER_TABLE).insert({
                name: user.getUsername(),
                email: user.getEmail(),
                phone: user.getPhone(),
                status: 'Active'
            })
        } catch (error: any) {
            console.log('Error on secondary', error)
            throw new Error(`Failed to create secondary database user: ${error.message || error}`)
        }
    }


    public getAllUsers = async (): Promise<UserModel[]> => {
        try {
            const users = await ConnectToDatabase.con(this.USER_TABLE)
            return users
        } catch (error: any) {
            throw new Error(`Failed to fetch users: ${error.message || error}`)
        }
    }

    
    public findById = async (id: string): Promise<UserModel | undefined> => {
        try {
            const [user] = await ConnectToDatabase.con(this.USER_TABLE).where({ id })
            return user
        } catch (error: any) {
            throw new Error(`Failed to fetch user by ID: ${error.message || error}`)
        }
    }


    public getProfile = async (id: string): Promise<UserModel | undefined> => {
        try {
            const [user] = await ConnectToDatabase.con(this.USER_TABLE)
                .select(
                    "id", "username", "email", "street", "cep", "number",
                    "neighbourhood", "city", "state", "complement", "phone"
                )
                .where({ id })

            return user
        } catch (error: any) {
            throw new Error(`Failed to fetch user profile: ${error.message || error}`)
        }
    }

    
    public findByEmail = async (email: string): Promise<UserModel | undefined> => {
        try {
            const [user] = await ConnectToDatabase.con(this.USER_TABLE)
                .select("id", "username", "password")
                .where({ email })

            return user
        } catch (error: any) {
            throw new Error(`Failed to fetch user by email: ${error.message || error}`)
        }
    }


    public findDbSecondaryByEmail = async (email: string): Promise<UserModel | undefined> => {
        try {
            const [dbSecondaryuser] = await ConnectToDatabase.dbSecondary(this.CUSTOMER_TABLE)
                .where({ email })

            return dbSecondaryuser
        } catch (error: any) {
            throw new Error(`Failed to fetch user by email: ${error.message || error}`)
        }
    }


    public saveResetToken = async (user_id: string, token: string): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.RESET_PASSWORD_TABLE)
                .insert({
                    id: uuidv4(),
                    user_id,
                    token: token,
                    expires_at: new Date(Date.now() + 15 * 60 * 1000)
                })
        } catch (error: any) {
            throw new Error(`Failed to save reset token: ${error.message || error}`)
        }
    }   
    

    public updatePassword = async (id: string, newPasswordHash: string): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.USER_TABLE)
                .update({ password: newPasswordHash })
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to update password: ${error.message || error}`)
        }
    }


    public clearResetToken = async (id: string): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.RESET_PASSWORD_TABLE)
                .del()
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to clear reset token: ${error.message || error}`)
        }
    }

    
    public registerAddress = async (id: string, address: AddressDTO): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.USER_TABLE)
                .update({
                    street: address.street,
                    cep: address.cep,
                    number: address.number,
                    neighbourhood: address.neighbourhood,
                    city: address.city,
                    state: address.state,
                    complement: address.complement
                })
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to update address: ${error.message || error}`)
        }
    }


    public updateUser = async (id: string, username: string, phone: string): Promise<void> => {
        try {
            await ConnectToDatabase.con(this.USER_TABLE)
                .update({ username, phone })
                .where({ id })
        } catch (error: any) {
            throw new Error(`Failed to update user profile: ${error.message || error}`)
        }
    }
    

    public deleteUser = async (id: string): Promise<void> => {
        const connection = ConnectToDatabase.con;

        try {
            await connection.transaction(async (trx) => {
                await trx(this.ORDER_TABLE).del().where({ client: id })
                await trx(this.USER_TABLE).del().where({ id })
            })
        } catch (error: any) {
            throw new Error(`Failed to delete user and associated orders: ${error.message || error}`)
        }
    }


    public deleteUserByEmail = async (email: string): Promise<void> => {
        const connection = ConnectToDatabase.con
        const user = await this.findByEmail(email)

        try {
            await connection.transaction(async (trx) => {
                await trx(this.ORDER_TABLE).del().where({ client: user?.id })
                await trx(this.USER_TABLE).del().where({ email })
            })
        } catch (error: any) {
            throw new Error(`Failed to delete user and associated orders: ${error.message || error}`)
        }
    }


    public deleteSecondaryDBUserByEmail = async (email: string): Promise<void> => {
        const connection = ConnectToDatabase.con
        const user = await this.findByEmail(email)

        try {
            await ConnectToDatabase.dbSecondary(this.CUSTOMER_TABLE).del().where({ email })
        } catch (error: any) {
            throw new Error(`Failed to delete secondary database user: ${error.message || error}`)
        }
    }

}