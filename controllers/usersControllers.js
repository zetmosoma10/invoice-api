import _ from "lodash";
import { User, validateUser } from "../models/User.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "./../utils/CustomError.js";
import cloudinary from "./../configs/cloudinary.js";

export const register = asyncErrorHandler(async (req, res, next) => {
  const err = validateUser(req.body);
  if (err) {
    return next(new CustomError(err, 400));
  }

  const { firstName, lastName, email, password } = req.body;

  const userInDb = await User.findOne({ email });

  if (userInDb) {
    return next(new CustomError("User with given email already exist", 400));
  }

  const user = await User.create({ firstName, lastName, email, password });
  const token = user.generateJwt();

  res.status(201).send({
    success: true,
    token,
  });
});

export const getCurrentUser = asyncErrorHandler(async (req, res, next) => {
  const user = _.pick(req.user, [
    "_id",
    "firstName",
    "lastName",
    "email",
    "profilePicUrl",
  ]);

  res.status(200).send({
    success: true,
    user,
  });
});

export const uploadImage = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;
  const file = req.file;
  if (!file) {
    return next(new CustomError("No image file uploaded", 400));
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile-pics",
      resource_type: "auto",
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePicUrl: result.secure_url,
      },
      { new: true }
    );

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).send({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicUrl: result.secure_url,
    });
  } catch (error) {
    console.log("cloudinary upload error", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to upload to Cloudinary" });
  }
});
