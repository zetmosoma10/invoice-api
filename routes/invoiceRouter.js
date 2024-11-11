import express from "express";
import {
  createInvoice,
  getAllInvoices,
} from "../controllers/invoiceController.js";
import auth from "./../middlewares/auth.js";

const router = express.Router();

router.route("/").get(auth, getAllInvoices).post(auth, createInvoice);

export default router;
