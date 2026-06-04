const shopModel = require('../model/shopModel.js');
const userModel = require('../model/userModel.js');

async function getShop(req, res) {
    try {
        const shop = await shopModel.findOne({ _id: req.user.shop_id });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        res.status(200).json(shop);
    } catch (err) {
        console.log(err);
        
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateShop(req, res) {
    try {
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const updateShop = await shopModel.findOneAndUpdate({ _id: req.user.shop_id }, {
            ...req.body
        }, { new: true });

        if (!updateShop) return res.status(404).json({ error: 'Shop not found' });

        res.status(200).json(updateShop);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTel(req, res) {
    try {
        const ownerPhone = await userModel.findOne({ shop_id: req.user.shop_id, role: "owner" });
        if (!ownerPhone) return res.status(404).json({ error: 'Owner not found' });

        res.status(200).json(ownerPhone.phone);
    } catch (err) {
        console.log(err);
        
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getShop,
    updateShop,
    getTel
};