import express from "express";
import {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoice,
  markAsPaid,
  updateInvoice,
} from "../controllers/invoiceController.js";
import auth from "./../middlewares/auth.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = express.Router();

router.route("/").get(auth, getAllInvoices).post(auth, createInvoice);
router
  .route("/:id")
  .get(validateObjectId, auth, getInvoice)
  .patch(validateObjectId, auth, updateInvoice)
  .delete(validateObjectId, auth, deleteInvoice);
router.route("/:id/markAsPaid").patch(validateObjectId, auth, markAsPaid);

export default router;
