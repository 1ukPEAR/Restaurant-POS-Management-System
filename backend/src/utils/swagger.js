// src/utils/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shop POS API",
      version: "1.0.0",
      description: "API documentation for Shop POS backend (Owner / Worker).",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local dev",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    // ทำให้ทุก endpoint ต้องใช้ token เป็นค่า default
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // ให้ไปอ่าน JSDoc จากไฟล์ routes ทั้งหมด
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
