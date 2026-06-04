const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController.js");
const authenticateToken = require("../middleware/auth");
const checkShopOpen = require("../middleware/shopOpen");

// ใช้แบบที่เพื่อนอยากใช้
router.get("/order", authenticateToken, checkShopOpen, orderController.getOrders);
router.post("/order/add", authenticateToken, checkShopOpen, orderController.addOrder);
router.put("/order/update/:transaction_id", authenticateToken, checkShopOpen, orderController.updateOrderByTable);
router.post("/order/pay", authenticateToken, checkShopOpen, orderController.payOrder);
router.post("/order/cancel", authenticateToken, checkShopOpen, orderController.cancelOrder);
router.post("/order/bill", authenticateToken, checkShopOpen, orderController.getOrderByTable);

router.get("/order/sales-summary", authenticateToken, orderController.getSalesSummary);
router.get("/order/history", authenticateToken, orderController.getOrderHistory);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: POS Order APIs
 */

/**
 * @swagger
 * /api/order:
 *   get:
 *     summary: Get all transactions
 *     description: ดึงรายการ Order ทั้งหมดของร้าน (เรียงจากใหม่ไปเก่า)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all orders
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/order/add:
 *   post:
 *     summary: Create a new order
 *     description: สร้างคำสั่งซื้อใหม่ พร้อมคำนวณ subtotal / tax / service charge / grand total อัตโนมัติ
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               table_id:
 *                 type: string
 *                 example: T-03
 *               username:
 *                 type: string
 *                 example: worker01
 *               order:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [menu_id, menu_price, amount]
 *                   properties:
 *                     menu_id:
 *                       type: string
 *                       example: F-0003
 *                     menu_name:
 *                       type: string
 *                       example: Spaghetti
 *                     menu_price:
 *                       type: number
 *                       example: 120
 *                     amount:
 *                       type: number
 *                       example: 2
 *                     menu_options:
 *                       type: array
 *                       example: [{"option_name": "Extra Cheese", "option_price": 10}]
 *                       items:
 *                         type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Shop not found
 */

/**
 * @swagger
 * /api/order/update/{transaction_id}:
 *   put:
 *     summary: Add or update items in a pending order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *         example: TX-000015
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [table_id, orderItems]
 *             properties:
 *               table_id:
 *                 type: string
 *                 example: T-03
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menu_id:
 *                       type: string
 *                       example: F-0002
 *                     menu_name:
 *                       type: string
 *                       example: Fried Chicken
 *                     menu_price:
 *                       type: number
 *                       example: 79
 *                     amount:
 *                       type: number
 *                       example: 1
 *                     menu_options:
 *                       type: array
 *                       items:
 *                         type: object
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Missing fields
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/order/pay:
 *   post:
 *     summary: Complete payment for an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [transaction_id, payment_method]
 *             properties:
 *               transaction_id:
 *                 type: string
 *                 example: TX-000015
 *               payment_method:
 *                 type: string
 *                 enum: [cash, transfer, card]
 *                 example: cash
 *               cash_received:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Payment completed
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/order/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [transaction_id]
 *             properties:
 *               transaction_id:
 *                 type: string
 *                 example: TX-000015
 *     responses:
 *       200:
 *         description: Order cancelled
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/order/bill:
 *   post:
 *     summary: Get current pending order by table
 *     description: ใช้ดึงบิลที่ยังค้างชำระของโต๊ะ — เหมาะกับหน้า "ดูบิล"
 *     tags: [Order]
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
 *                 example: T-03
 *     responses:
 *       200:
 *         description: Returns pending orders for the table
 *       404:
 *         description: Table not found
 */

/**
 * @swagger
 * /api/order/sales-summary:
 *   get:
 *     summary: Get sales summary
 *     description: ดึงยอดขายรวมตามช่วงวันที่
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, yesterday, 7days, 30days, month, year, custom]
 *         example: day
 *       - in: query
 *         name: start
 *         required: false
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *       - in: query
 *         name: end
 *         required: false
 *         schema:
 *           type: string
 *           example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Summary data
 *       400:
 *         description: Invalid range or missing dates
 */

/**
 * @swagger
 * /api/order/history:
 *   get:
 *     summary: Get order history
 *     description: ดึงประวัติ order ทั้งหมด filtered by status (optional)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, cancelled]
 *         example: paid
 *     responses:
 *       200:
 *         description: Successfully fetched history
 */
