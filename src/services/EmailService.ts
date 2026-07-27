import nodemailer from 'nodemailer'



export default class EmailService{
    private transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASSWORD
        }
    })


    public sendPasswordResetEmail = async(email:string, token:string):Promise<string>=>{
        const info = await this.transporter.sendMail({
            from: 'My Delivery app',
            to: email,
            subject: 'Password reset request',
            html: `
                <h2>Password Reset</h2>
                <p><a href="http://localhost:5173/reset-request?anything=${token}" target="_blank">Clique here</a> to register a new password</p>
                <p>This code expires in 15 minutes</p>
            `
        })
        
        const previewUrl = nodemailer.getTestMessageUrl(info)
        if(!previewUrl){
            throw new Error('No proview URL was generated')
        }

        return previewUrl
    } 
}