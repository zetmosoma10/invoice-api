import _ from "lodash";
import { User, validateUserUpdate } from "../models/User.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "./../utils/CustomError.js";
import cloudinary from "./../configs/cloudinary.js";

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

export const updateUser = asyncErrorHandler(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new CustomError("Password cannot be update with this operation.", 400)
    );
  }

  const err = validateUserUpdate(req.body);
  if (err) {
    return next(new CustomError(err, 400));
  }

  const { firstName, lastName, email } = req.body;
  const userInDb = req.user;

  const updatedUser = await User.findByIdAndUpdate(
    userInDb.id,
    {
      firstName: firstName || userInDb.firstName,
      lastName: lastName || userInDb.lastName,
      email: email || userInDb.email,
    },
    { new: true, runValidators: true }
  );

  const user = _.pick(updatedUser, [
    "firstName",
    "lastName",
    "_id",
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
        profilePicId: result.public_id,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile picture uploaded successfully",
      user,
    });
  } catch (error) {
    console.log("cloudinary upload error", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to upload to Cloudinary" });
  }
});

export const deleteImage = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    await cloudinary.uploader.destroy(user.profilePicId);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePicUrl: null,
        profilePicId: null,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile picture deleted successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error deleting profile pic in cloudinary",
    });
  }
});
