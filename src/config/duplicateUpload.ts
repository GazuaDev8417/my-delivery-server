import multer from "multer"
import { resolve, extname } from 'path'
import { Request, Response, NextFunction } from "express"
import fs from 'fs'

/* ================================= THAT'S FOR USE IN THE LOCALHOST =============================== */

const path1 = resolve(__dirname, '..', '..', '..', 'my-delivery-provider', 'public', 'imgs', 'products')
const path2 = resolve(__dirname, '..', '..', '..', 'my-delivery', 'public', 'imgs', 'products')

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path1)
    },
    filename: (req, file, cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const fileExtension = extname(file.originalname)
        const generatedFilename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`

        cb(null, generatedFilename)
    }
})


export const replicateUpload = (req:Request, res:Response, next:NextFunction)=>{
    if(!req.file) return next()

    const filename = req.file.filename
    const sourceFile = resolve(path1, filename)
    const destFile2 = resolve(path2, filename)

    try{
        if(!fs.existsSync(path2)) fs.mkdirSync(path2, { recursive: true })
        fs.copyFileSync(sourceFile, destFile2)

        next()
    }catch(e){
        console.error('An error occurred while duplicating file: ', e)
        res.status(500).json({ e: 'Error duplicating file through the system'})
    }
}


export const uploadLocal = multer({ storage })