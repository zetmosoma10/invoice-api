import express from "express";
import testRouter from "./routes/testRoute.js";

const app = express();

app.use("/", testRouter);

export default app;
