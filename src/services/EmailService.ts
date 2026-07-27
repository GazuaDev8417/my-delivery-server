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
        const customertUrl = process.env.CUSTOMER_CLIENT_URL

        const info = await this.transporter.sendMail({
            from: 'My Delivery app',
            to: email,
            subject: 'Password reset request',
            html: `
                <h2>Password Reset</h2>
                <p><a href="${customertUrl}/reset-request?anything=${token}" target="_blank">Clique here</a> to register a new password</p>
                <p>This code expires in 15 minutes</p>
            `
        })
        
        const previewUrl = nodemailer.getTestMessageUrl(info)
        if(!previewUrl){
            throw new Error('No proview URL was generated')
        }

        return previewUrl
    }
    
    
    public restaurantPasswordResetEmail = async(email:string, token:string):Promise<string>=>{
        const providerUrl = process.env.PROVIDER_CLIENT_URL
        const url = `${providerUrl}/reset-request?anything=${token}`;

        console.log({
            providerUrl,
            url
        });

        const info = await this.transporter.sendMail({
            from: 'My Delivery app',
            to: email,
            subject: 'Password reset request',
            html: `
                <h2>Password Reset</h2>
                <p><a href="${providerUrl}/reset-request?anything=${token}" target="_blank">Clique here</a> to register a new password</p>
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