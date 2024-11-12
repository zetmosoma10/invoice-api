import express from "express";
import { getCurrentUser, register } from "../controllers/usersControllers.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/me").get(auth, getCurrentUser);

export default router;
