const shopModel = require('../model/shopModel.js');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');


function generateId(prefix, items, field) {
    const last = items?.length ? items[items.length - 1][field] : null;
    const next = last ? parseInt(last.split('-')[1]) + 1 : 1;
    return `${prefix}-${next.toString().padStart(4, '0')}`;
}

async function getMenu(req, res) {
    try {
        const shop = await shopModel.findById(req.user.shop_id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });
        res.status(200).json(shop.menu_category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addMenu(req, res) {
    try {
        const { menu_category, menu_name, menu_desc, menu_price } = req.body;
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const shop = await shopModel.findById(req.user.shop_id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        let { menu_option } = req.body;
        if (typeof menu_option === 'string') {
            try {
                menu_option = JSON.parse(menu_option);
            } catch {
                menu_option = [];
            }
        }

        menu_option = menu_option.map((opt, i) => ({
            option_id: `O-${(i + 1).toString().padStart(4, '0')}`,
            ...opt
        }));

        const list = shop.menu_category[menu_category];
        const menu_id = generateId(menu_category == "dessert" ? "DE" : menu_category[0], list, 'menu_id');

        let menu_image = null;
        if (req.file) {
            const uploadRes = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'shop_menu' },
                    (err, result) => (err ? reject(err) : resolve(result))
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            menu_image = uploadRes.secure_url;
        }

        const newMenu = {
            menu_id,
            menu_name,
            menu_desc,
            menu_price,
            menu_image,
            menu_option
        };

        await shopModel.findOneAndUpdate(
            { _id: req.user.shop_id },
            { $push: { [`menu_category.${menu_category}`]: newMenu } },
            { new: true }
        );

        res.status(201).json({ message: 'Menu created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateMenu(req, res) {
    try {
        const { menu_category, menu_id } = req.body;
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const shop = await shopModel.findById(req.user.shop_id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        const menu = shop.menu_category[menu_category].find(m => m.menu_id === menu_id);
        if (!menu) return res.status(404).json({ error: 'Menu not found' });

        let menu_image = menu.menu_image;
        if (req.file) {
            if (menu.menu_image) {
                const parts = menu.menu_image.split('/');
                const publicId = parts.slice(-2).join('/').replace(/\.[^/.]+$/, '');
                await cloudinary.uploader.destroy(publicId);
            }

            const uploadRes = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'shop_menu' },
                    (err, result) => (err ? reject(err) : resolve(result))
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            menu_image = uploadRes.secure_url;
        }

        let { menu_name, menu_desc, menu_price, menu_option } = req.body;
        if (typeof menu_option === 'string') {
            try {
                menu_option = JSON.parse(menu_option);
            } catch {
                menu_option = [];
            }
        }

        const updateFields = {};
        const prefix = `menu_category.${menu_category}.$[m]`;

        if (menu_name) updateFields[`${prefix}.menu_name`] = menu_name;
        if (menu_desc) updateFields[`${prefix}.menu_desc`] = menu_desc;
        if (menu_price) updateFields[`${prefix}.menu_price`] = menu_price;
        if (menu_image) updateFields[`${prefix}.menu_image`] = menu_image;
        if (menu_option) updateFields[`${prefix}.menu_option`] = menu_option;

        await shopModel.findOneAndUpdate(
            { _id: req.user.shop_id },
            { $set: updateFields },
            { new: true, arrayFilters: [{ 'm.menu_id': menu_id }] }
        );

        res.status(200).json({ message: 'Menu updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

async function deleteMenu(req, res) {
    try {
        const { menu_category, menu_id } = req.body;
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const shop = await shopModel.findById(req.user.shop_id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        const menu = shop.menu_category[menu_category].find(m => m.menu_id === menu_id);
        if (!menu) return res.status(404).json({ error: 'Menu not found' });

        if (menu.menu_image) {
            const parts = menu.menu_image.split('/');
            const publicId = parts.slice(-2).join('/').replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
        }

        const updatedShop = await shopModel.findOneAndUpdate(
            { _id: req.user.shop_id },
            { $pull: { [`menu_category.${menu_category}`]: { menu_id } } },
            { new: true }
        );

        res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getMenu,
    addMenu,
    updateMenu,
    deleteMenu
};
