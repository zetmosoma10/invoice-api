import mongoose from "mongoose";
import CustomError from "./../utils/CustomError.js";

const validateObjectId = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new CustomError("Invalid objectId.", 400));
  }

  next();
};

export default validateObjectId;
