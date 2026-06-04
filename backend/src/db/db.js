const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shop_system';

const dbConnect = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('[OK] Connected to MongoDB');
    } catch (err) {
        console.error('[ERROR] Error connecting to MongoDB:', err);
    }
};

module.exports = dbConnect;
