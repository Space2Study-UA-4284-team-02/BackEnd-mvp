const swaggerJsDoc = require('swagger-jsdoc')

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API for Space2Study',
      version: '1.0.0',
      description: 'Swagger documentation for Space2Study API'
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:3000'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'Enter cookie for authentication'
        }
      }
    }
  },
  apis: ['./src/docs/**/*.js']
}

const swaggerSpec = swaggerJsDoc(swaggerOptions)

module.exports = swaggerSpec