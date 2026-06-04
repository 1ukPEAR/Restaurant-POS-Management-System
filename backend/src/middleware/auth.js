const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel.js');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
    try {
        if (!req.headers['authorization']) return res.status(401).json({ message: 'No token provided' });
        const token = req.headers['authorization'].split(' ')[1] == undefined ? req.headers['authorization'] : req.headers['authorization'].split(' ')[1];

        if (!token) return res.status(401).json({ message: 'No token provided' });

        jwt.verify(token, SECRET_KEY, async (err, decode) => {

            if (err) return res.status(403).json({ message: 'Invalid token' });
            const user = await userModel.findOne({ username: decode.username });
            if (user.isActive === false) return res.status(403).json({ message: 'Account is inactive' });

            req.user = {
                username: user.username,
                role: user.role,
                shop_name: user.shop_name,
                shop_id: user.shop_id
            };
            next();
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }

}

module.exports = authenticateToken;
