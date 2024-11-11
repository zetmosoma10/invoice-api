import express from "express";
import cors from "cors";
import morgan from "morgan";
import globalErrorMiddleware from "./middlewares/globalErrorMiddleware.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use(globalErrorMiddleware);

export default app;
