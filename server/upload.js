import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import express from 'express';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

cloudinary.config({
  cloud_name: process.env.CLD_CLOUD,
  api_key: process.env.CLD_KEY,
  api_secret: process.env.CLD_SECRET
});

router.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("📤 Uploading file:", req.file.originalname);

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'classbazz', resource_type: "auto" },
      (err, result) => {
        if (err) {
          console.error("Cloudinary error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json(result);
      }
    );
    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
