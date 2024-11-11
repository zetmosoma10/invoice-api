import express from "express";
import { testConroller } from "../controllers/testController.js";

const router = express.Router();

router.get("/").use(testConroller);

export default router;
