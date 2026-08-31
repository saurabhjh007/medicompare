import express from "express";
import {
  addHospital,
  getHospitals,
  getHospitalById,
  searchService,
  deleteHospital,
  updateHospital,
  addHospitalReview,
} from "../controllers/hospitalController.js";

const router = express.Router();

router.post("/", addHospital);
router.get("/", getHospitals);
router.get("/search", searchService);
router.get("/:id", getHospitalById);
router.put("/:id", updateHospital);
router.delete("/:id", deleteHospital);
router.post("/:id/reviews", addHospitalReview);

export default router;