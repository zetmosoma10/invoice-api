import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoice,
} from "../controllers/invoiceController.js";
import auth from "./../middlewares/auth.js";

const router = express.Router();

router.route("/").get(auth, getAllInvoices).post(auth, createInvoice);
router.route("/:id").get(auth, getInvoice).delete(auth, deleteInvoice);

export default router;
