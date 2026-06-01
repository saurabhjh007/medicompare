import express from "express";
import {
  addHospital,
  getHospitals,
  searchService,
  deleteHospital,
} from "../controllers/hospitalController.js";

const router = express.Router();

router.post("/", addHospital);
router.get("/", getHospitals);
router.get("/search", searchService);
router.delete("/:id", deleteHospital);

export default router;