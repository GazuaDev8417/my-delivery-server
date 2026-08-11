import swaggerJsdoc from 'swagger-jsdoc'



const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My Delivery API Server',
            version: '1.0.0',
            description: 'Central API service powering the My Delivery Consumer App, Merchant Provider Hub, and SaaS Dashboard.',
            contact: {
                name: 'Flamarion França',
                url: 'https://portfolio-vtu0.onrender.com'
            }
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
                    description: 'Enter your Customer Bearer JWT token'
                },
                MerchantAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your Merchant Bearer JWT token'
                }
            }
        }
    },
    apis: ['./src/routes/*.ts', './api/index.ts']    
}


export const swaggerSpec = swaggerJsdoc(options)
