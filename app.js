import express from "express";
import cors from "cors";
import globalErrorMiddleware from "./middlewares/globalErrorMiddleware.js";
import catchAllRoutes from "./middlewares/catchAllRoutes.js";
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authRouter.js";
import invoiceRouter from "./routes/invoiceRouter.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/auth", authRouter);
app.use("*", catchAllRoutes);
app.use(globalErrorMiddleware);

export default app;
