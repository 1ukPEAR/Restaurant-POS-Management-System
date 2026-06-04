const shopModel = require('../model/shopModel.js');

function generateTableId(tables) {
    if (!tables || tables.length === 0) return 'T-0001';
    const last = tables[tables.length - 1].table_id;
    const next = parseInt(last.split('-')[1]) + 1;
    return `T-${next.toString().padStart(4, '0')}`;
}

async function getTables(req, res) {
    try {
        const shop = await shopModel.findById(req.user.shop_id);

        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        res.status(200).json(shop.tables || [] );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addTable(req, res) {
    try {
        const { capacity } = req.body;
        if (!capacity) return res.status(400).json({ error: 'Missing required fields' });

        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const shop = await shopModel.findById(req.user.shop_id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        const table_id = generateTableId(shop.tables);

        const newTable = {
            table_id,
            capacity,
            status: 'available'
        };

        await shopModel.findOneAndUpdate(
            { _id: req.user.shop_id },
            { $push: { tables: newTable } },
            { new: true }
        );

        res.status(200).json({ message: 'Add table successfully'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateTable(req, res) {
    try {
        const { table_id, capacity, status } = req.body;

        if (!table_id) 
            return res.status(400).json({ error: 'Missing table_id' });

        // รองรับการอัปเดตหลายฟิลด์
        const updateFields = {};
        const prefix = "tables.$[t]";

        if (capacity !== undefined)
            updateFields[`${prefix}.capacity`] = capacity;

        if (status !== undefined)
            updateFields[`${prefix}.status`] = status;

        const updatedShop = await shopModel.findOneAndUpdate(
            { _id: req.user.shop_id },
            { $set: updateFields },
            {
                new: true,
                arrayFilters: [{ "t.table_id": table_id }]
            }
        );

        if (!updatedShop)
            return res.status(404).json({ error: 'Table not found' });

        res.status(200).json({ 
            message: 'Update table successfully',
            tables: updatedShop.tables
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteTable(req, res) {
    try {
        const { table_id } = req.body;
        if (!table_id) return res.status(400).json({ error: 'Missing table_id' });

        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const updatedShop = await shopModel.findOneAndUpdate(
            { _id: req.user.shop_id },
            { $pull: { tables: { table_id } } },
            { new: true }
        );

        if (!updatedShop) return res.status(404).json({ error: 'Table not found' });

        res.status(200).json({ message: 'Remove table successfully'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getTables,
    addTable,
    updateTable,
    deleteTable
};
