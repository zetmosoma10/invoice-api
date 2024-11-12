import _ from "lodash";
import { User, validateUser } from "../models/User.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "./../utils/CustomError.js";

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
  const user = _.pick(req.user, ["_id", "firstName", "lastName", "email"]);

  res.status(200).send({
    success: true,
    user,
  });
});
