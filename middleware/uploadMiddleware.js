const multer = require('multer');
const path = require('path');

// Kaha aur kis naam se file save hogi, ye set karta hai
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');   // "uploads" folder mein save hoga
  },
  filename: function (req, file, cb) {
    // unique naam banane ke liye: timestamp + original extension
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

// sirf images allow karo (jpg, png, jpeg)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png) are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;