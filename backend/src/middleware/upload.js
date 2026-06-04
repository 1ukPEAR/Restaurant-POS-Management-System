// middleware/upload.js
const multer = require('multer');

const storage = multer.memoryStorage(); // ต้องใช้ memoryStorage เพื่อส่งไฟล์ไป Cloudinary
const upload = multer({ storage });

module.exports = upload;
