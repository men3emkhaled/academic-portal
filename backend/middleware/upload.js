const multer = require('multer');
const path = require('path');
const fs = require('fs');

// تأكد من وجود مجلد uploads الأساسي
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------- إعدادات رفع ملفات Excel ----------
const excelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const excelFileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.xlsx', '.xls', '.csv'];
    
    if (allowedTypes.includes(file.mimetype) || allowedExt.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Only Excel files are allowed. Received: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// ---------- ✅ إعدادات رفع صور الإجابات المقالية ----------
const writtenAnswerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/written_answers';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Force safe extension if original name is tampered
        let ext = path.extname(file.originalname).toLowerCase();
        const safeExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!safeExts.includes(ext)) ext = '.jpg'; // Fallback
        cb(null, uniqueSuffix + ext);
    }
});

const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) with correct extensions are allowed'), false);
    }
};

const uploadWrittenAnswer = multer({
    storage: writtenAnswerStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB للصورة
});

// ---------- إعدادات رفع صور البروفايل (Memory Storage for Supabase) ----------
const avatarStorage = multer.memoryStorage();
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const allowedImageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedImageMimes.includes(file.mimetype) && allowedImageExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, GIF, and WEBP images are allowed!'), false);
        }
    }
});

const uploadMaterial = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    fileFilter: (req, file, cb) => {
        const allowedExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip', '.rar', '.png', '.jpg', '.jpeg', '.webp'];
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-zip-compressed',
            'image/png', 'image/jpeg', 'image/jpg', 'image/webp'
        ];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, Office documents, TXT, Zips/Rars, and Images'), false);
        }
    }
});

// ---------- معالج الأخطاء الموحد ----------
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Max size is 50MB for materials.' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// ✅ تصدير جميع الكائنات
module.exports = { 
    upload, 
    uploadWrittenAnswer, 
    uploadAvatar,
    uploadMaterial,
    handleMulterError 
};