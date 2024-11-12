import jwt from "jsonwebtoken";
import CustomError from "./../utils/CustomError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { User } from "../models/User.js";

const auth = asyncErrorHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  // * check if token exist
  if (!token) {
    return next(
      new CustomError("Authentication token missing. Please login", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_STR);

  const user = await User.findById({ _id: decoded._id });
  // * check if user for given token exist
  if (!user) {
    return next(
      new CustomError(
        "User associated with the token doest not exist. Please login again",
        401
      )
    );
  }

  req.user = user;

  next();
});

export default auth;
