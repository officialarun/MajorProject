// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//     cloud_name:process.env.CLOUD_NAME,
//     api_key:process.env.CLOUD_API_KEY,
//     api_secret:process.env.CLOUD_API_SECRET

// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: "wnaderlust_DEV",
//       allowedFormats: ["png","jpg","jpeg"],
//     },
//   });

// module.exports={
//     cloudinary,
//     storage,
// }
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Set Up Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "wanderlust_DEV", // Change this to your desired folder name
      format: async (req, file) => "png", // Convert all uploads to PNG
      public_id: (req, file) => file.originalname, // Use the original filename
    },
});

// Initialize Multer with Cloudinary Storage
const upload = multer({ storage });

module.exports = { cloudinary, upload };
