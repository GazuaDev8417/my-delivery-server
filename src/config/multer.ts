import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { Request, Response, NextFunction } from "express"



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})


export const uploadToCloudinary = async(req:Request, res:Response, next:NextFunction)=>{
    if(!req.file) return next()

    try{
        const result = await new Promise((resolve, reject)=>{
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'products'
                },
                (error, result)=>{
                    if(error) return reject(error)
                    resolve(result)
                }
            )

            stream.end(req.file?.buffer)
        })

        req.body.image = (result as any).secure_url
        next()
    }catch(e){
        console.error('An error occurred while sending image to cloudinary:', e)
        res.status(500).json({ error: 'Error uploading image.' })
    }
}