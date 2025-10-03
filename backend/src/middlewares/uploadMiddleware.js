// import multer from "multer";
// import path from "path";

// // ✅ Correct Storage Configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');  // Use relative path without leading slash
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// // ✅ Correct file filter function signature
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only .jpeg, .jpg, and .png formats are allowed'), false);
//     }
// };

// // ✅ Correct way to initialize multer
// const upload = multer({ storage, fileFilter });

// export default upload;
