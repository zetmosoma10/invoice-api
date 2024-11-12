import { User } from "../models/User.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import _ from "lodash";

export const register = asyncErrorHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

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
