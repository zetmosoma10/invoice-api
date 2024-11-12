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

export const getInvoice = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    return next(new CustomError("Invoice for given id doest not exist", 404));
  }

  res.status(200).send({
    success: true,
    invoice,
  });
});

export const updateInvoice = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user._id;

  const currentInvoice = await Invoice.findOne({ _id: id, user: userId });
  if (!currentInvoice) {
    return next(new CustomError("Invoice not found", 404));
  }

  const invoice = await Invoice.findByIdAndUpdate(
    id,
    {
      $set: {
        billFrom: {
          address: {
            street:
              updateData.billFrom?.address?.street ||
              currentInvoice.billFrom.address.street,
            city:
              updateData.billFrom?.address?.city ||
              currentInvoice.billFrom.address.city,
            postalCode:
              updateData.billFrom?.address?.postalCode ||
              currentInvoice.billFrom.address.postalCode,
            country:
              updateData.billFrom?.address?.country ||
              currentInvoice.billFrom.address.country,
          },
        },
        billTo: {
          clientName:
            updateData.billTo?.clientName || currentInvoice.billTo.clientName,
          clientEmail:
            updateData.billTo?.clientEmail || currentInvoice.billTo.clientEmail,
          address: {
            street:
              updateData.billTo?.address?.street ||
              currentInvoice.billTo.address.street,
            city:
              updateData.billTo?.address?.city ||
              currentInvoice.billTo.address.city,
            postalCode:
              updateData.billTo?.address?.postalCode ||
              currentInvoice.billTo.address.postalCode,
            country:
              updateData.billTo?.address?.country ||
              currentInvoice.billTo.address.country,
          },
          invoiceDate:
            updateData.billTo?.invoiceDate || currentInvoice.billTo.invoiceDate,
          paymentTerms:
            updateData.billTo?.paymentTerms ||
            currentInvoice.billTo.paymentTerms,
          projectDescription:
            updateData.billTo?.projectDescription ||
            currentInvoice.billTo.projectDescription,
          items: updateData.billTo?.items || currentInvoice.billTo.items,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).send({
    success: true,
    invoice,
  });
});

export const deleteInvoice = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const invoice = await Invoice.findByIdAndDelete(id);
  if (!invoice) {
    return next(new CustomError("Invoice already deleted", 400));
  }

  res.status(200).send({
    success: true,
  });
});
