const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage }).single('avatar');

// Utility function to handle the upload process using a Promise
const uploadFile = (req, res) => {
    return new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject({ success: false, message: err.message });
            } else if (!req.file) {
                reject({ success: false, message: 'No file selected' });
            } else {
                resolve(req.file);
            }
        });
    });
};

module.exports = uploadFile;
