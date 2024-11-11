import express from "express";
import userRouter from "./routes/userRouter.js";

const app = express();

app.use("/", userRouter);

export default app;
