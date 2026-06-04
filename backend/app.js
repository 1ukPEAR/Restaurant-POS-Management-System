const express = require('express');
const cors = require('cors');
const app = express();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/utils/swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./src/routes/authRoute'));
app.use('/api', require('./src/routes/userRoute'));
app.use('/api', require('./src/routes/shopRoute'));
app.use('/api', require('./src/routes/menuRoute'));
app.use('/api', require('./src/routes/tableRoutes'));
app.use("/api", require('./src/routes/orderRoute'));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
