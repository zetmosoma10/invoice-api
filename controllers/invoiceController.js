import { Invoice } from "../models/Invoice.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";

export const createInvoice = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;

  const { billFrom, billTo } = req.body;

  const invoice = await Invoice.create({
    user: user._id,
    billFrom: {
      address: {
        street: billFrom.address.street,
        city: billFrom.address.city,
        postalCode: billFrom.address.postalCode,
        country: billFrom.address.country,
      },
    },
    billTo: {
      clientName: billTo.clientName,
      clientEmail: billTo.clientEmail,
      address: {
        street: billTo.address.street,
        city: billTo.address.city,
        postalCode: billTo.address.postalCode,
        country: billTo.address.country,
      },
      paymentTerms: billTo.paymentTerms,
      projectDescription: billTo.projectDescription,
      items: billTo.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  });

  res.status(201).send({
    success: true,
    invoice,
  });
});

export const getAllInvoices = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;

  const invoices = await Invoice.find({ user: userId });

  res.status(200).send({
    success: true,
    count: invoices.length,
    invoices,
  });
});
