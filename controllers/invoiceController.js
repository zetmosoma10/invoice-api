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

  const { billFrom, billTo, status } = req.body;

  if (!["Draft", "Pending"].includes(status)) {
    return next(
      new CustomError("Status must be 'draft' or 'pending' at creation", 400)
    );
  }

  const invoice = await Invoice.create({
    user: user._id,
    status: status,
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

  try {
    await sendEmail({
      clientEmail: invoice.billTo.clientEmail,
      subject: "Your Invoice is Created",
      htmlContent: template(invoice),
    });
  } catch (error) {
    console.log("Error happend while sending email");
    console.log(error);
  }

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

  const invoices = await Invoice.find(query).skip(skip).limit(pageLimit);

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

  try {
    await sendEmail({
      clientEmail: invoice.billTo.clientEmail,
      subject: "Your Invoice is Paid",
      htmlContent: paidTemplate(invoice),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error happend while sending paid email notification",
    });
  }

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

  try {
    await sendEmail({
      clientEmail: invoice.billTo.clientEmail,
      subject: `Invoice Reminder: Invoice ${invoice.invoiceNumber} Due Soon`,
      htmlContent: reminderTemplate(invoice),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error happend while sending email reminder",
    });
  }

  res.status(200).send({
    success: true,
  });
});
