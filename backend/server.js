require('dotenv').config();
const connectDB = require('./src/db/db.js');
connectDB();
const app = require('./app.js');

const API_PORT = process.env.API_PORT || 3000;

app.listen(API_PORT, () => {
    console.log(`🌐 API Server running on port ${API_PORT}`);
});
