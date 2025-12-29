import swaggerJsdoc from 'swagger-jsdoc';


export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi:'3.0.0',
        info: {
            title:"VerifyCart API",
            version:'1.0.0',
            description:`
            Vendor verification and trust system
            Roles:
            - Vendor
            - Admin
            Authentication:
            - JWT via HttpOnly cookies
            `,
        },
        servers:[
            {
                url:"http://localhost:3000",
                description:"Local Development"
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "http",
                    scheme: "cookie",
                    name: "jwt",
                },
            },
        },
        security: [
            {
                cookieAuth: [],
            },
        ],  
    },
    apis:['./src/routes/*.js', './src/controllers/*.js'],
});