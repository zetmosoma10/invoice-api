import crypto from "crypto";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import {
  User,
  validateUser,
  validatePassword,
  validateLoginInput,
} from "../models/User.js";
import asyncErrorHandler from "./../utils/asyncErrorHandler.js";
import CustomError from "./../utils/CustomError.js";
import sendEmail from "./../email/email.js";
import resetPasswordTemplate from "../email/resetPasswordTemplate.js";
import passwordSuccessTemplate from "../email/passwordSuccessTemplate.js";

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

export const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  // * 1 -> get email and validate it in db
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Provided email does not exist", 400));
  }

  // * 2 -> generate token and save it in db
  const token = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;

  // * 3 -> send email token
  try {
    await sendEmail({
      clientEmail: email,
      subject: "We’ve Received Your Password Reset Request",
      htmlContent: resetPasswordTemplate(user, resetUrl),
    });

    res.status(200).send({
      success: true,
      message: "We have sent password reset link to your email",
    });
  } catch (error) {
    next(
      new CustomError("Error happened while sending reset password email", 500)
    );
  }
});

export const resetPassword = asyncErrorHandler(async (req, res, next) => {
  // * 1 -> Validate token
  const { token, id, password } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return next(new CustomError("User not found", 404));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  if (user.resetPasswordToken !== hashedToken) {
    return next(new CustomError("Invalid token provided", 400));
  }

  // * 2 -> check if token is not expired
  const currentTime = dayjs();
  const hasFifteenMinutesPassed = currentTime.isAfter(
    user.resetPasswordTokenExpire
  );

  if (hasFifteenMinutesPassed) {
    user.resetPasswordTokenExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    return next(
      new CustomError("Provided token has expired, request another link.", 400)
    );
  }

  // * 3 -> get password & validate it,
  const err = validatePassword({ password });
  if (err) {
    return next(new CustomError(err, 400));
  }

  // * 4 ->  save password to db, reset db token & db token expireTime
  user.password = password;
  user.resetPasswordTokenExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  // * 5 -> Generate jwt
  const jwt = user.generateJwt();

  try {
    await sendEmail({
      clientEmail: user.email,
      subject: "Your Password Has Been Successfully Reset",
      htmlContent: passwordSuccessTemplate(user),
    });
  } catch (error) {
    console.log(error);
  }

  // * 6 -> Login user
  res.status(200).send({
    success: true,
    token: jwt,
  });
});
