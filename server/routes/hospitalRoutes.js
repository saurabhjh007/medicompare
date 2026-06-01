import express from "express";
import {
  addHospital,
  getHospitals,
  searchService,
  deleteHospital,
  updateHospital,
} from "../controllers/hospitalController.js";

const router = express.Router();

router.post("/", addHospital);
router.get("/", getHospitals);
router.get("/search", searchService);
router.delete("/:id", deleteHospital);
router.put("/:id", updateHospital);

export default router;