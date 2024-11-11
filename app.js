import express from "express";
import cors from "cors";
import morgan from "morgan";
import userRouter from "./routes/userRouter.js";

const app = express();

app.use(cors());
app.use(express.json());
if (process.env === "development") {
  console.log(morgan("dev"));
}
app.use("/api/user", userRouter);

export default app;
