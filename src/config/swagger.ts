import swaggerJsdoc from 'swagger-jsdoc'
import path from 'path'



const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My Delivery API Server',
            version: '1.0.0',
            description: [
    'Central API service powering the My Delivery Consumer App, Merchant Provider, and SaaS Dashboard.',
    '',
    '> **⚠️ Note:** This is a demo/portfolio project. Some routes (such as \`DELETE\` and \`signup\`) were intentionally omitted or restricted, since they would allow creating or deleting real users/data in a publicly accessible demo environment'
            ].join('\n'),
            contact: {
                name: 'Flamarion França',
                url: 'https://portfolio-vtu0.onrender.com'
            },            
        },
        servers: [
            {
                url: 'https://my-delivery-server-nine.vercel.app/',
                description: 'Production server'
            },
            {
                url: 'http://localhost:3003',
                description: 'Local development server'
            }
        ],
        components: {
            securitySchemes: {
                CustomAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your Customer Bearer JWT token without quotes.'
                },
                MerchantAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your Merchant Bearer JWT token without quotes.'
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../api/*.ts'),
        path.join(__dirname, '../api/*.js')
    ]    
}


export const swaggerSpec = swaggerJsdoc(options)
