import express from "express";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import compression from "compression";
import rateLimit from "express-rate-limit";
import sanitize from "express-mongo-sanitize";
import globalErrorMiddleware from "./middlewares/globalErrorMiddleware.js";
import catchAllRoutes from "./middlewares/catchAllRoutes.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import invoiceRouter from "./routes/invoiceRouter.js";

const app = express();

const limiter = rateLimit({
  limit: 1000,
  windowMs: 60 * 60 * 1000,
  message:
    "We have receive too many request from this IP Address. Please try again in one hour.",
});

const corsOptions = {
  origin: process.env.FRONTEND_URL,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(sanitize());
app.use(xss());
app.use("/api", limiter);
app.use(compression());
app.use("/api/user", userRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/auth", authRouter);
app.use("*", catchAllRoutes);
app.use(globalErrorMiddleware);

export default app;
