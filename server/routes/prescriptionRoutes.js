import express from "express";
import { uploadPrescription } from "../middleware/uploadMiddleware.js";
import {
  analyzePrescription,
  comparePrescriptionTests,
} from "../controllers/prescriptionController.js";

const router = express.Router();

// Middleware wrapper to handle Multer upload errors gracefully
const handleUpload = (req, res, next) => {
  uploadPrescription.single("prescription")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post("/analyze", handleUpload, analyzePrescription);
router.post("/compare-tests", comparePrescriptionTests);

export default router;
