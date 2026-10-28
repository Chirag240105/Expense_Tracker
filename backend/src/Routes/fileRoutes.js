import express from "express";
import multer from "multer";
import { uploadToGridFS, streamFromGridFS } from "../services/gridfsService.js";
import { protect } from "../middlewares/AuthMiddleware.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

router.post(
  "/upload",
  protect,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "No file uploaded");
    }

    const result = await uploadToGridFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      { uploadedBy: req.user._id, uploadDate: new Date() }
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    return streamFromGridFS(req.params.id, res);
  })
);

export default router;
