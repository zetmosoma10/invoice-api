import bcrypt from "bcrypt";
import joi from "joi";
import { User, validateUser } from "../models/User.js";
import asyncErrorHandler from "./../utils/asyncErrorHandler.js";
import CustomError from "./../utils/CustomError.js";

const validateLoginInput = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).max(150).required(),
  });

  const { error } = schema.validate(data);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

export const login = asyncErrorHandler(async (req, res, next) => {
  const err = validateLoginInput(req.body);
  if (err) {
    return next(new CustomError(err, 400));
  }

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
