import express from "express";
import {
  createPaymentOrder,
  verifyPaymentAndBook,
  getRazorpayKey,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/key", getRazorpayKey);
router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPaymentAndBook);

export default router;
