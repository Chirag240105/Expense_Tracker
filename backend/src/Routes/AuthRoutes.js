import express from "express";
import { getUser, login, signUp } from "../Controller/AuthController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/getInfo", protect, getUser);

// router.post("/upload-image", upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//     }


//     const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

//     res.status(200).json({ imageUrl });
// });

export default router;
