import multer from "multer"
import { resolve } from "path"
import { Request, Response, NextFunction } from 'express'
import fs from 'fs'


const path1 = resolve(__dirname, '..', '..', '..', 'my-delivery-provider', 'public', 'imgs', 'restaurants')
const path2 = resolve(__dirname, '..', '..', '..', 'my-delivery', 'public', 'imgs', 'restaurants')

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path1)
    },
    filename: (req, file, cb)=>{

        cb(null, file.originalname)
    }
})


export const replicatedSignupUpload = (req:Request, res:Response, next:NextFunction)=>{
    if(!req.file) return next()

    const filename = req.file.filename
    const sourceFile = resolve(path1, filename)
    const destFile2 = resolve(path2, filename)

    try{
        if(!fs.existsSync(path2)) fs.mkdirSync(path2, { recursive: true })
        fs.copyFileSync(sourceFile, destFile2)

        next()
    }catch(e){
        console.error('An error occurred while inserting file: ', e)
        res.status(500).json({ e: 'Error inserting file through the system'})
    }
}


export const uploadSignupImage = multer({ storage })
