import express from "express";
import {
  deleteImage,
  deleteUser,
  getCurrentUser,
  updateUser,
  uploadImage,
} from "../controllers/usersControllers.js";
import auth from "../middlewares/auth.js";
import upload from "../configs/multer.js";

const router = express.Router();

router.route("/get-current-user").get(auth, getCurrentUser);
router.route("/update-user").patch(auth, updateUser);
router.route("/delete-user").post(auth, deleteUser);

router.route("/delete-profile-image").post(auth, deleteImage);
router
  .route("/upload-profile-image")
  .post(auth, upload.single("profilePicture"), uploadImage);

export default router;
