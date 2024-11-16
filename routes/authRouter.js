import express from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
} from "../controllers/authControllers.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").patch(resetPassword);

export default router;
