const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/reset-password', authController.resetPassword);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: admin
 *             password: admin
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             example:
 *               message: Login successful
 *               role: owner
 *               token: jwt_token_here
 *       401:
 *         description: Invalid username or password
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new shop owner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               [username, password, email, phone, shop_name, shop_address]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               shop_name:
 *                 type: string
 *               shop_address:
 *                 type: string
 *               open_time:
 *                 type: string
 *               close_time:
 *                 type: string
 *           example:
 *             username: owner01
 *             password: test
 *             email: test@mail.com
 *             phone: "0900000000"
 *             shop_name: Cafe ABC
 *             shop_address: Bangkok
 *             open_time: "08:00"
 *             close_time: "22:00"
 *     responses:
 *       201:
 *         description: Registered successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User and shop created successfully
 *               role: owner
 *               token: jwt_token_here
 *       409:
 *         description: User or email already exists
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request OTP to reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *           example:
 *             email: user@mail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP sent successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP from email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *           example:
 *             email: user@mail.com
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password after verifying OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *           example:
 *             email: user@mail.com
 *             newPassword: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: OTP not verified or missing fields
 */
