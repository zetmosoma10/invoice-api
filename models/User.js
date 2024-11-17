import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import joi from "joi";
import crypto from "crypto";
import dayjs from "dayjs";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
  },
  profilePicUrl: {
    type: String,
    default: null,
  },
  profilePicId: {
    type: String,
    default: null,
  },
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
});

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  } catch (err) {
    next(err);
  }

  next();
});

userSchema.methods.generateJwt = function () {
  return jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    },
    process.env.JWT_SECRET_STR,
    { expiresIn: process.env.JWT_EXPIRES }
  );
};

userSchema.methods.createResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // ! Start token expire Timer
  this.resetPasswordTokenExpire = dayjs().add(15, "minutes");

  return token;
};

const validateUser = (data) => {
  const schema = joi.object({
    firstName: joi.string().min(3).max(50).required(),
    lastName: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(150).required(),
    profilePicUrl: joi.string(),
    profilePicId: joi.string(),
  });

  const { error } = schema.validate(data, { abortEarly: false });
  return error ? error.details.map((err) => err.message) : null;
};

const validateUserUpdate = (data) => {
  const schema = joi.object({
    firstName: joi.string().min(3).max(50).optional(),
    lastName: joi.string().min(3).max(50).optional(),
    email: joi.string().email().optional(),
  });

  const { error } = schema.validate(data, { abortEarly: false });
  return error ? error.details.map((err) => err.message) : null;
};

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

function validatePassword(data) {
  const schema = joi.object({
    password: joi.string().min(4).required(),
  });

  const { error } = schema.validate(data);
  return error ? error.details[0].message : null;
}

const User = mongoose.model("User", userSchema);

export {
  User,
  validateUser,
  validatePassword,
  validateUserUpdate,
  validateLoginInput,
};
