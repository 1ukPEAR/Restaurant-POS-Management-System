const express = require('express');
const router = express.Router();
const shopController = require('../controller/shopController');
const middleware = require('../middleware/auth');

router.get('/shop',middleware, shopController.getShop);
router.put('/shop/update',middleware, shopController.updateShop);
router.get('/shop/tel',middleware, shopController.getTel);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Shop
 *   description: Manage shop information
 */

/**
 * @swagger
 * /api/shop:
 *   get:
 *     summary: Get shop information
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop information
 *         content:
 *           application/json:
 *             example:
 *               _id: "65fca0c9b12345a903f5a111"
 *               shop_name: "Cafe ABC"
 *               shop_address: "Bangkok"
 *               open_time: "08:00"
 *               close_time: "22:00"
 *               tax_enabled: true
 *               service_charge_enabled: true
 *               service_charge_rate: 0.1
 *               tables:
 *                 - table_id: T-0001
 *                   capacity: 4
 *                   status: available
 *               menu_category:
 *                 food: []
 *                 drink: []
 *                 dessert: []
 *                 other: []
 *               create_at: "2024-01-01T10:00:00Z"
 *       404:
 *         description: Shop not found
 */

/**
 * @swagger
 * /api/shop/update:
 *   put:
 *     summary: Update shop information
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shop_name:
 *                 type: string
 *                 example: New Cafe Name
 *               shop_address:
 *                 type: string
 *                 example: Chiang Mai
 *               open_time:
 *                 type: string
 *                 example: "09:00"
 *               close_time:
 *                 type: string
 *                 example: "21:00"
 *               tax_enabled:
 *                 type: boolean
 *                 example: true
 *               service_charge_enabled:
 *                 type: boolean
 *                 example: true
 *               service_charge_rate:
 *                 type: number
 *                 example: 0.1
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *         content:
 *           application/json:
 *             example:
 *               shop_name: "New Cafe Name"
 *               shop_address: "Chiang Mai"
 *               open_time: "09:00"
 *               close_time: "21:00"
 *               tax_enabled: true
 *               service_charge_enabled: true
 *               service_charge_rate: 0.1
 *       401:
 *         description: Unauthorized (only owner allowed)
 *       404:
 *         description: Shop not found
 */
