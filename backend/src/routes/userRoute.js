const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const middleware = require('../middleware/auth');

router.get('/user', middleware, userController.getUser);
router.get('/user/profile', middleware, userController.getUserProfile);
router.post('/user/create', middleware, userController.createWorker);
router.put('/user/update/:username', middleware, userController.updateUser);
router.patch('/user/resetPassword/:username', middleware, userController.resetPassword);
router.delete('/user/:username', middleware, userController.deleteUser);
router.put('/user/updateOwner/:username', middleware, userController.updateOwner);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Manage workers and owner account in the shop
 */


/* -------------------------------------------------------------
   GET /api/user  — Get all workers
------------------------------------------------------------- */
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all workers in the shop
 *     description: 
 *       คืนข้อมูลพนักงาน (role = worker) ทั้งหมดในร้าน  
 *       *เฉพาะ owner เท่านั้นที่ดูได้*
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workers in the shop
 *         content:
 *           application/json:
 *             example:
 *               - username: worker01
 *                 email: worker@mail.com
 *                 phone: "0900000000"
 *                 role: worker
 *                 isActive: true
 *                 create_at: "2025-01-10T10:30:00Z"
 *       401:
 *         description: Unauthorized — only owner can see workers
 */


/* -------------------------------------------------------------
   GET /api/user/profile  — Get your own profile
------------------------------------------------------------- */
/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     description: 
 *       ดึงโปรไฟล์ของผู้ใช้ที่ login อยู่ (owner หรือ worker ก็ได้)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             example:
 *               username: worker01
 *               email: worker@mail.com
 *               phone: "0912345678"
 *               role: worker
 *               isActive: true
 *       500:
 *         description: Internal server error
 */


/* -------------------------------------------------------------
   POST /api/user/create — Create worker account
------------------------------------------------------------- */
/**
 * @swagger
 * /api/user/create:
 *   post:
 *     summary: Create a new worker account
 *     description: 
 *       สร้างบัญชีพนักงานใหม่ (เฉพาะ owner ที่สามารถสร้างได้)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, email, phone]
 *             properties:
 *               username:
 *                 type: string
 *                 example: worker02
 *               password:
 *                 type: string
 *                 example: "123456"
 *               email:
 *                 type: string
 *                 example: worker2@mail.com
 *               phone:
 *                 type: string
 *                 example: "0800000000"
 *     responses:
 *       201:
 *         description: Worker created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized — only owner can create worker
 *       409:
 *         description: Username or Email already exists
 */


/* -------------------------------------------------------------
   PUT /api/user/update/{username} — Update worker
------------------------------------------------------------- */
/**
 * @swagger
 * /api/user/update/{username}:
 *   put:
 *     summary: Update worker information
 *     description: 
 *       เจ้าของร้านสามารถแก้ไขข้อมูลพนักงาน เช่น email, phone, isActive
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: worker01
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: newworker@mail.com
 *               phone:
 *                 type: string
 *                 example: "0812345678"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Worker updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User updated successfully
 *       401:
 *         description: Unauthorized — only owner can update worker
 *       404:
 *         description: Worker not found
 */


/* -------------------------------------------------------------
   PATCH /api/user/resetPassword/{username}
------------------------------------------------------------- */
/**
 * @swagger
 * /api/user/resetPassword/{username}:
 *   patch:
 *     summary: Reset worker password
 *     description: 
 *       เจ้าของร้านสามารถ reset password ของพนักงานได้
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: worker03
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset successfully
 *       401:
 *         description: Unauthorized — only owner can reset password
 *       404:
 *         description: User not found
 */


/* -------------------------------------------------------------
   DELETE /api/user/{username}
------------------------------------------------------------- */
/**
 * @swagger
 * /api/user/{username}:
 *   delete:
 *     summary: Delete a worker
 *     description:
 *       เจ้าของร้านสามารถลบพนักงานได้ (แต่ห้ามลบ owner)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: worker04
 *     responses:
 *       200:
 *         description: Worker deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User deleted successfully
 *       400:
 *         description: Cannot delete owner
 *       401:
 *         description: Unauthorized — only owner can delete worker
 *       404:
 *         description: User not found
 */


/* -------------------------------------------------------------
   PUT /api/user/updateOwner/{username}
------------------------------------------------------------- */
/**
 * @swagger
 * /api/user/updateOwner/{username}:
 *   put:
 *     summary: Update owner information
 *     description: 
 *       ปรับข้อมูลเจ้าของร้าน เช่น email, phone  
 *       (ใช้ได้เฉพาะ owner ที่ล็อกอินอยู่)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: owner01
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: newowner@mail.com
 *               phone:
 *                 type: string
 *                 example: "0801234567"
 *     responses:
 *       200:
 *         description: Owner updated successfully
 *       401:
 *         description: Unauthorized — only owner can update owner data
 *       404:
 *         description: Owner not found
 */
