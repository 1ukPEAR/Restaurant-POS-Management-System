const userModel = require('../model/userModel.js');
const bcrypt = require('../utils/bcrypt.js')

async function createWorker(req, res) {
    try {
        const { username, password, email, phone } = req.body;
        if (!username || !password || !email || !phone) {
            return res.status(400).json({ error: 'missing required fields' });
        }

        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const checkUser = await userModel.findOne({ username });
        if (checkUser) return res.status(409).json({ error: 'User already exists' });

        const checkEmail = await userModel.findOne({ email });
        if (checkEmail) return res.status(409).json({ error: 'Email already exists' });
        
        const hashedPassword = await bcrypt.hashPassword(password);

        await userModel.create({
            username,
            password: hashedPassword,
            role: "worker",
            email,
            phone,
            shop_id: req.user.shop_id,
            isActive: true,
            create_at: new Date()
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {

        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getUser(req, res) {
    try {
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const users = await userModel.find({ shop_id: req.user.shop_id, role: 'worker' }, {}, { password: 0, __v: 0 });

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getUserProfile(req, res) {
    try {
        const users = await userModel.findOne({ username: req.user.username }, {}, { password: 0, __v: 0 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateUser(req, res) {
    try {
        const {email, phone, isActive } = req.body;
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });
        console.log(req.params.username);
        
        const updateUser = await userModel.findOneAndUpdate({ username: req.params.username, shop_id: req.user.shop_id }, {
            email,
            phone,
            isActive: isActive ? true : false
        }, { new: true });

        if (!updateUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

async function resetPassword(req, res) {
    try {
        const { newPassword } = req.body;
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const updateUser = await userModel.findOneAndUpdate({ username: req.params.username, shop_name: req.user.shop_name }, {
            password: await bcrypt.hashPassword(newPassword)
        }, { new: true });

        if (!updateUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

async function deleteUser(req, res) {
    try {
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const checkOwner = await userModel.findOne({ username: req.params.username});
        if (checkOwner.role === 'owner') return res.status(400).json({ error: 'Cannot delete owner' });

        const deleteUser = await userModel.findOneAndDelete({ 
            username: req.params.username, 
            shop_name: req.user.shop_name,
        });

        if (!deleteUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

async function updateOwner(req, res) {
    try {
        const { email, phone } = req.body;
        if (req.user.role !== 'owner') return res.status(401).json({ error: 'Unauthorized' });

        const updateUser = await userModel.findOneAndUpdate({ username: req.params.username, role: 'owner' }, {
            email,
            phone
        }, { new: true });

        if (!updateUser) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

module.exports = {
    createWorker,
    getUser,
    getUserProfile,
    updateUser,
    resetPassword,
    deleteUser,
    updateOwner
};