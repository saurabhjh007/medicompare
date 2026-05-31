import express from "express";
import {
  addHospital,
  getHospitals,
  searchService,
} from "../controllers/hospitalController.js";

const router = express.Router();

router.post("/", addHospital);
router.get("/", getHospitals);
router.get("/search", searchService);

export default router;