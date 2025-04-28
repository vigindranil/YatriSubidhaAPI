const fs = require('fs');
const path = require('path');

// Utility function to delete a file
const deleteImage = (filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../uploads', filename);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                reject({ success: false, message: 'File not found' });
            } else {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        reject({ success: false, message: 'Error deleting file' });
                    } else {
                        resolve({ success: true, message: 'File deleted successfully' });
                    }
                });
            }
        });
    });
};

module.exports = deleteImage;
