import CustomError from "../utils/CustomError.js";

const catchAllRoutes = (req, res, next) => {
  return next(new CustomError(`Invalid resource: ${req.originalUrl}`, 404));
};

export default catchAllRoutes;
