import { Invoice, validateInvoice } from "../models/Invoice.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import sendEmail from "../email/email.js";
import reminderTemplate from "./../email/reminderTemplate.js";
import paidTemplate from "./../email/paidTemplate.js";
import template from "./../email/template.js";

export const createInvoice = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;

  const err = validateInvoice(req.body);
  if (err) {
    return next(new CustomError(err, 400));
  }

  const {
    status,
    senderAddress,
    clientName,
    clientEmail,
    clientAddress,
    paymentTerms,
    description,
    items,
  } = req.body;

  if (!["Draft", "Pending"].includes(status)) {
    return next(
      new CustomError("Status must be 'draft' or 'pending' at creation", 400)
    );
  }

  const invoice = await Invoice.create({
    user: user._id,
    status: status,
    senderAddress: {
      street: senderAddress.street,
      city: senderAddress.city,
      postalCode: senderAddress.postalCode,
      country: senderAddress.country,
    },
    clientName: clientName,
    clientEmail: clientEmail,
    clientAddress: {
      street: clientAddress.street,
      city: clientAddress.city,
      postalCode: clientAddress.postalCode,
      country: clientAddress.country,
    },
    paymentTerms: paymentTerms,
    description: description,
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  });

  // try {
  //   await sendEmail({
  //     clientEmail: invoice.clientEmail,
  //     subject: "Your Invoice is Created",
  //     htmlContent: template(invoice),
  //   });
  // } catch (error) {
  //   console.log("Error happend while sending email");
  //   console.log(error);
  // }

  res.status(201).send({
    success: true,
    invoice,
  });
});

export const getAllInvoices = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 6, status } = req.query;

  const pageNumber = Math.max(Number(page), 1);
  const pageLimit = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * pageLimit;

  const query = { user: userId };

  if (status) {
    if (!["Draft", "Pending", "Paid"].includes(status)) {
      return next(
        new CustomError(
          "Invalid status value. Must be 'Draft', 'Pending', or 'Paid'.",
          400
        )
      );
    }

    // * Attach status query to query object
    query.status = status;
  }

  const totalInvoices = await Invoice.countDocuments(query);
  const totalPages = Math.ceil(totalInvoices / pageLimit);

  if (pageNumber > totalPages && totalPages > 0) {
    return next(
      new CustomError(
        `Page ${pageNumber} does not exist. There are only ${totalPages} page(s) available.`,
        404
      )
    );
  }

  const invoices = await Invoice.find(query)
    .sort("createdAt")
    .skip(skip)
    .limit(pageLimit);

  res.status(200).send({
    success: true,
    currentPage: pageNumber,
    totalInvoicesPerPage: invoices.length,
    totalInvoices,
    totalPages,
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
  const userId = req.user._id;

  // * Check if invoice exist in database
  const currentInvoice = await Invoice.findOne({ _id: id, user: userId });
  if (!currentInvoice) {
    return next(new CustomError("Invoice not found", 404));
  }

  const updateData = req.body;

  // * validate incoming data with joi
  const err = validateInvoice(req.body);
  if (err) {
    return next(new CustomError(err, 400));
  }

  // * update the invoice
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    {
      $set: {
        senderAddress: {
          street:
            updateData?.senderAddress?.street ||
            currentInvoice.senderAddress.street,
          city:
            updateData?.senderAddress?.city ||
            currentInvoice.senderAddress.city,
          postalCode:
            updateData?.senderAddress?.postalCode ||
            currentInvoice.senderAddress.postalCode,
          country:
            updateData?.senderAddress?.country ||
            currentInvoice.senderAddress.country,
        },
        clientName: updateData?.clientName || currentInvoice.clientName,
        clientEmail: updateData?.clientEmail || currentInvoice.clientEmail,
        clientAddress: {
          street:
            updateData?.clientAddress?.street ||
            currentInvoice.clientAddress.street,
          city:
            updateData?.clientAddress?.city ||
            currentInvoice.clientAddress.city,
          postalCode:
            updateData?.clientAddress?.postalCode ||
            currentInvoice.clientAddress.postalCode,
          country:
            updateData?.clientAddress?.country ||
            currentInvoice.clientAddress.country,
        },
        invoiceDate: currentInvoice.invoiceDate,
        paymentTerms: updateData?.paymentTerms || currentInvoice.paymentTerms,
        description: updateData?.description || currentInvoice.description,
        items: updateData?.items || currentInvoice.items,
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

export const markAsPaid = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const invoice = await Invoice.findByIdAndUpdate(
    { _id: id, user: userId },
    { status: "Paid" },
    { new: true }
  );

  if (!invoice) {
    return next(new CustomError("Invoice not found", 404));
  }

  invoice.paidAt = Date.now();
  await invoice.save();

  // try {
  //   await sendEmail({
  //     clientEmail: invoice.clientEmail,
  //     subject: "Your Invoice is Paid",
  //     htmlContent: paidTemplate(invoice),
  //   });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).send({
  //     success: false,
  //     message: "Error happend while sending paid email notification",
  //   });
  // }

  res.status(200).send({
    success: true,
    invoice,
  });
});

export const sendReminder = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const invoice = await Invoice.findOne({ _id: id, user: userId });

  if (!invoice) {
    return next(new CustomError("Invoice not found", 404));
  }

  if (invoice.status === "Paid") {
    return next(
      new CustomError(
        "Invoice is Paid. Cannot send a reminder to a Paid invoice",
        400
      )
    );
  }

  // try {
  //   await sendEmail({
  //     clientEmail: invoice.clientEmail,
  //     subject: `Invoice Reminder: Invoice ${invoice.invoiceNumber} Due Soon`,
  //     htmlContent: reminderTemplate(invoice),
  //   });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).send({
  //     success: false,
  //     message: "Error happend while sending email reminder",
  //   });
  // }

  res.status(200).send({
    success: true,
  });
});
