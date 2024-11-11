import CustomError from "../utils/CustomError.js";
process.env.NODE_ENV = "production";

const developmentErrors = (err, res) => {
  res.status(err.statusCode).send({
    success: false,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const productionErrors = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).send({
      success: false,
      message: err.message,
    });
  } else {
    res.status(500).send({
      success: false,
      message: "Something went wrong, please try again later",
    });
  }
};

// !ERRORS FROM MONGOOSE (name:CastError, name:ValidationError , code:11000)
//
// !CastError HANDLER
const castErrorHandler = (err) => {
  const msg = `Invalid value for ${err.path}:${err.value}`;
  return new CustomError(msg, 400);
};
//
// ! Code:11000 HANDLER
const duplicateKeyErrorHandler = (err) => {
  const msg = "User with given email already exist. Please use another email.";
  return new CustomError(msg, 400);
};
//
// ! ValidationError HANDLER
const validationErrorHandler = (err) => {
  const errorMessages = Object.values(err.errors).map((item) => item.message);
  const msg = `Invalid input data: ${errorMessages.join(". ")}`;
  return new CustomError(msg, 400);
};
//
//! ERROR FROM JSONWEBTOKEN LIBRARY
//
//! TokenExpireError
const tokenExpireErrorHandler = (err) => {
  return new CustomError("Token expired, Please login again!", 401);
};
//
//! JsonWebTokenError
const JsonWebTokenErrorHandler = (err) => {
  return new CustomError("Invalid token signature, Please login again!", 401);
};

// * GLOBAL ERROR MIDDLEWARE
export default function globalErrorMiddleware(error, req, res, next) {
  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    developmentErrors(error, res);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);
    if (error.name === "JsonWebTokenError")
      error = JsonWebTokenErrorHandler(error);
    if (error.name === "TokenExpiredError")
      error = tokenExpireErrorHandler(error);

    productionErrors(error, res);
  } else if (process.env.NODE_ENV === "test") {
    res.status(error.statusCode).send({
      success: false,
      message: error.message,
    });
  }
}
