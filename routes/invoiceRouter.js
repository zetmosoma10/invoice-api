import express from "express";
import { createInvoice } from "../controllers/invoiceController.js";
import auth from "./../middlewares/auth.js";

const router = express.Router();

router.route("/").post(auth, createInvoice);

export default router;
