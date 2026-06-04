const shopModel = require("../model/shopModel.js");

const checkShopOpen = async (req, res, next) => {
    try {
        const shop = await shopModel.findOne({ _id: req.user.shop_id });
        if ( req.user.role === 'owner') {
            return next();
        }

        if (!shop) {
            return res.status(404).json({ error: "Shop not found" });
        }

        if (!shop.open_time || !shop.close_time) {
            return next();
        }

        const now = new Date();
        const current = now.getHours() * 60 + now.getMinutes(); // นาทีรวม

        const timeOpen = shop.open_time.split(":");
        const timeClose = shop.close_time.split(":");

        const openH = parseInt(timeOpen[0], 10);
        const openM = parseInt(timeOpen[1], 10);
        const closeH = parseInt(timeClose[0], 10);
        const closeM = parseInt(timeClose[1], 10);

        const openMin = openH * 60 + openM;
        const closeMin = closeH * 60 + closeM;

        if (current < openMin || current > closeMin) {
            return res.status(403).json({
                error: "ร้านปิดอยู่ ไม่สามารถรับออเดอร์ได้ในขณะนี้",
            });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = checkShopOpen;
