const express = require('express');
const router = express.Router();
const tableController = require('../controller/tableController');
const middleware = require('../middleware/auth');

router.get('/table', middleware, tableController.getTables);
router.post('/table/create', middleware, tableController.addTable);
router.put('/table/update', middleware, tableController.updateTable);
router.delete('/table/delete', middleware, tableController.deleteTable);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Table
 *   description: Manage shop tables
 */

/**
 * @swagger
 * /api/table:
 *   get:
 *     summary: Get all tables
 *     tags: [Table]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tables
 *         content:
 *           application/json:
 *             example:
 *               - table_id: T-0001
 *                 capacity: 4
 *                 status: available
 *               - table_id: T-0002
 *                 capacity: 2
 *                 status: unavailable
 *       404:
 *         description: Shop not found
 */

/**
 * @swagger
 * /api/table/create:
 *   post:
 *     summary: Create a new table
 *     tags: [Table]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [capacity]
 *             properties:
 *               capacity:
 *                 type: number
 *                 example: 4
 *     responses:
 *       200:
 *         description: Table created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Add table successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized (only owner can add table)
 *       404:
 *         description: Shop not found
 */

/**
 * @swagger
 * /api/table/update:
 *   put:
 *     summary: Update table information
 *     tags: [Table]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [table_id]
 *             properties:
 *               table_id:
 *                 type: string
 *                 example: T-0001
 *               capacity:
 *                 type: number
 *                 example: 6
 *               status:
 *                 type: string
 *                 enum: [available, unavailable, reserved]
 *                 example: reserved
 *     responses:
 *       200:
 *         description: Table updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Update table successfully
 *               tables:
 *                 - table_id: T-0001
 *                   capacity: 6
 *                   status: reserved
 *       400:
 *         description: Missing table_id
 *       404:
 *         description: Table not found
 */

/**
 * @swagger
 * /api/table/delete:
 *   delete:
 *     summary: Delete a table
 *     tags: [Table]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [table_id]
 *             properties:
 *               table_id:
 *                 type: string
 *                 example: T-0003
 *     responses:
 *       200:
 *         description: Table removed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Remove table successfully
 *       400:
 *         description: Missing table_id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table not found
 */
