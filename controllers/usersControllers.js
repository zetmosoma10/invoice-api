import { User } from "../models/User.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

export const register = asyncErrorHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await User.create({ firstName, lastName, email, password });
  const token = user.generateJwt();

  res.status(201).send({
    success: true,
    token,
  });
});

export const getCurrentUser = async (req, res, next) => {};
