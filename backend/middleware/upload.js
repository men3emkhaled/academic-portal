const multer = require('multer');
const path = require('path');
const fs = require('fs');

// تأكد من وجود مجلد uploads
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/octet-stream'
    ];
    
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.xlsx', '.xls', '.csv'];
    
    if (allowedTypes.includes(file.mimetype) || allowedExt.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Only Excel files are allowed. Received: ${file.mimetype}`), false);
    }
};

// ✅ إنشاء upload object بشكل صحيح
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// ✅ معالج الأخطاء
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Max size is 10MB' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// ✅ التصدير الصحيح
module.exports = { upload, handleMulterError };