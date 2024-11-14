import express from "express";
import {
  getCurrentUser,
  register,
  uploadImage,
} from "../controllers/usersControllers.js";
import auth from "../middlewares/auth.js";
import upload from "../configs/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/profile").get(auth, getCurrentUser);
router
  .route("/profile/upload-image")
  .post(auth, upload.single("profilePicture"), uploadImage);

export default router;
