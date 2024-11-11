import { User } from "../models/User.js";

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = await User.create({ firstName, lastName, email, password });
    const token = user.generateJwt();

    res.status(201).send({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
};
