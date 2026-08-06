import UserData, { AddressDTO } from "../data/UserData"
import Services, { AppError } from "../services/Authentication"
import TokenService from "../services/TokenService"
import EmailService from "../services/EmailService"
import User from "../model/User"
import { UserModel } from "../model/typesAndInterfaces"


export interface SignupDTO {
    name?: string
    email?: string
    phone?: string
    password?: string
}

export interface LoginDTO {
    email?: string
    password?: string
}

export interface RequestPasswordResetDTO {
    email?: string
}

export interface ConfirmPasswordResetDTO {
    newPassword?: string
    confirmNewPassword?: string
}

export interface UpdateUserProfileDTO {
    username?: string
    email?: string
    phone?: string
}



export default class UserBusiness{
    private readonly EMAIL_REGEX = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    private readonly PHONE_REGEX = /^(\d{2})9\d{8}$/;


    constructor(
        private userData:UserData,
        private services:Services,
        private tokenService:TokenService,
        private emailService:EmailService
    ){}

//USER FIELD
    public signup = async (dto: SignupDTO): Promise<string> => {
        const { name, email, phone, password } = dto

        if (!name || !email || !phone || !password) {
            throw new AppError(400, "Please fill in all required registration fields")
        }

        if (!this.EMAIL_REGEX.test(email)) {
            throw new AppError(400, "Invalid email format")
        }

        if (!this.PHONE_REGEX.test(phone)) {
            throw new AppError(400, "Invalid phone number format (must be 11 digits starting with DD + 9)")
        }

        if (password.length < 6) {
            throw new AppError(400, "Password must be at least 6 characters long")
        }

        const registeredUser = await this.userData.findByEmail(email)
        const id = this.services.idGenerator()
        const hashedPassword = this.services.hashPassword(password)
        const token = this.tokenService.generateToken(id)
        const user = new User(id, name, email, phone, hashedPassword)

        await this.userData.createUser(user)

        return token
    }


    public login = async (dto: LoginDTO): Promise<string> => {
        const { email, password } = dto

        if (!email || !password) {
            throw new AppError(400, "Please fill in both email and password")
        }

        if (!this.EMAIL_REGEX.test(email)) {
            throw new AppError(400, "Invalid email format")
        }

        const user = await this.userData.findByEmail(email)
        if (!user) {
            throw new AppError(401, "Invalid email or password")
        }

        const isPasswordValid = this.services.comparePassword(password, user.password)
        if (!isPasswordValid) {
            throw new AppError(401, "Invalid email or password")
        }

        const token = this.tokenService.generateToken(user.id)

        return token
    }


    public getProfileByUser = async (targetUserId: string): Promise<UserModel> => {
        const profile = await this.userData.getProfile(targetUserId)

        if (!profile) {
            throw new AppError(404, "User profile not found")
        }

        return profile
    }


    public getAllUsers = async (providerId:string): Promise<UserModel[]> => {
        const users = await this.userData.getAllUsers(providerId)

        if (users.length === 0) {
            throw new AppError(404, "Users profile not found")
        }

        return users
    }


    public requestPasswordReset = async (dto: RequestPasswordResetDTO): Promise<string> => {
        const { email } = dto

        if (!email) {
            throw new AppError(400, "Email address is required")
        }

        const user = await this.userData.findByEmail(email)
        if (!user) {
            return `As this is a demonstration you have to insert visitor@email.com to be redirected to a test email account and reset your password`
        }
       
        const resetToken = this.tokenService.generateResetToken(user.id)

        await this.userData.saveResetToken(user.id, resetToken)
        const previewUrl = await this.emailService.sendPasswordResetEmail(email, resetToken)

        return previewUrl
    }

    
    public updatePassword = async (dto: ConfirmPasswordResetDTO, userId:string): Promise<void> => {
        const { newPassword, confirmNewPassword } = dto

        if (!confirmNewPassword || !newPassword) {
            throw new AppError(400, "Missing email, token, or new password")
        }

        if (newPassword.length < 6) {
            throw new AppError(400, "New password must be at least 6 characters")
        }

        if (newPassword !== confirmNewPassword) {
            throw new AppError(400, "Passwords do not matach")
        }

        const hashedPassword = this.services.hashPassword(newPassword)
        await this.userData.updatePassword(userId, hashedPassword)
        await this.userData.clearResetToken(userId)
    }


    public registerAddress = async (userId: string, addressDTO: AddressDTO): Promise<void> => {
        const { street, cep, number, neighbourhood, city, state } = addressDTO

        if (!street || !cep || !number || !neighbourhood || !city || !state) {
            throw new AppError(400, "Please fill in all required address fields")
        }

        await this.userData.registerAddress(userId, addressDTO)
    }


    public updateUser = async (userId: string, dto: UpdateUserProfileDTO): Promise<void> => {
        const { username, email, phone } = dto

        if (!username || !email || !phone) {
            throw new AppError(400, "Please fill in all required profile fields")
        }

        const existingUser = await this.userData.findById(userId)
        if(!existingUser){
            throw new AppError(404, 'User not found')
        }
        
        await this.userData.updateUser(userId, username, email, phone)
    }


    public deleteUser = async (userId: string): Promise<void> => {
        const user = await this.userData.findById(userId)
        if (!user) {
            throw new AppError(404, "User not found")
        }

        await this.userData.deleteUser(userId)
    }

}