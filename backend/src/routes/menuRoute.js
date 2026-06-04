const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');
const middleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/menu', middleware, menuController.getMenu);
router.post('/menu/add', middleware, upload.single('menu_image'), menuController.addMenu);
router.put('/menu/update', middleware, upload.single('menu_image'), menuController.updateMenu);
router.delete('/menu/delete', middleware, menuController.deleteMenu);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Manage shop menu
 */

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Get all menu categories
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All menu categories
 *         content:
 *           application/json:
 *             example:
 *               food: []
 *               drink: []
 *               dessert: []
 *               other: []
 *       404:
 *         description: Shop not found
 */

/**
 * @swagger
 * /api/menu/add:
 *   post:
 *     summary: Add new menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [menu_category, menu_name, menu_price]
 *             properties:
 *               menu_category:
 *                 type: string
 *                 enum: [food, drink, dessert, other]
 *                 example: food
 *               menu_name:
 *                 type: string
 *                 example: Cheeseburger
 *               menu_desc:
 *                 type: string
 *                 example: Juicy grilled beef with cheese
 *               menu_price:
 *                 type: number
 *                 example: 89
 *               menu_option:
 *                 type: string
 *                 example: '[{"option_name":"size L","option_price":10}]'
 *               menu_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Menu created successfully
 *       401:
 *         description: Unauthorized (only owner allowed)
 *       404:
 *         description: Shop not found
 */

/**
 * @swagger
 * /api/menu/update:
 *   put:
 *     summary: Update existing menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [menu_category, menu_id]
 *             properties:
 *               menu_category:
 *                 type: string
 *                 enum: [food, drink, dessert, other]
 *                 example: food
 *               menu_id:
 *                 type: string
 *                 example: F-0001
 *               menu_name:
 *                 type: string
 *               menu_desc:
 *                 type: string
 *               menu_price:
 *                 type: number
 *               menu_option:
 *                 type: string
 *                 example: '[{"option_name":"Extra cheese","option_price":5}]'
 *               menu_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Menu updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu or shop not found
 */

/**
 * @swagger
 * /api/menu/delete:
 *   delete:
 *     summary: Delete menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menu_category, menu_id]
 *             properties:
 *               menu_category:
 *                 type: string
 *                 enum: [food, drink, dessert, other]
 *                 example: drink
 *               menu_id:
 *                 type: string
 *                 example: D-0005
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Menu deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 */
