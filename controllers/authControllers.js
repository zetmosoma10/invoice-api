import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import asyncErrorHandler from "./../utils/asyncErrorHandler.js";
import CustomError from "./../utils/CustomError.js";

export const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError("Invalid email or password", 401));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(new CustomError("Invalid email or password", 401));
  }

  const token = user.generateJwt();

  res.status(200).send({
    success: true,
    token,
  });
});
