import { User } from "../models/User.js";

export const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await User.create({ firstName, lastName, email, password });

  res.status(201).send({
    success: true,
    user,
  });
};
