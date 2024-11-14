import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import joi from "joi";

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
  profilePicUrl: String,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
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

const validateUser = (data) => {
  const schema = joi.object({
    firstName: joi.string().min(3).max(50).required(),
    lastName: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(4).max(150).required(),
    profilePicUrl: joi.string(),
  });

  const { error } = schema.validate(data);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const User = mongoose.model("User", userSchema);

export { User, validateUser };
