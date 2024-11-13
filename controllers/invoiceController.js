import { Invoice, validateInvoice } from "../models/Invoice.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import sendEmail from "../utils/email.js";

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

  const invoiceId = invoice._id.toString();
  const invoiceNumber = "#" + invoiceId.slice(-4);

  try {
    await sendEmail({
      clientEmail: invoice.billTo.clientEmail,
      subject: "Your Invoice is Created",
      htmlContent: generateInvoiceContent(
        invoice.billTo.clientName,
        invoiceNumber,
        "5700"
      ),
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

  const invoiceId = invoice._id.toString();
  const invoiceNumber = "#" + invoiceId.slice(-4);

  try {
    await sendEmail({
      clientEmail: invoice.billTo.clientEmail,
      subject: "Your Invoice is Paid",
      htmlContent: generatePaidInvoiceContent(
        invoice.billTo.clientName,
        invoiceNumber,
        "5700"
      ),
    });
  } catch (error) {
    console.log("Error happend while sending email");
    console.log(error);
  }

  res.status(200).send({
    success: true,
    invoice,
  });
});

function generatePaidInvoiceContent(clientName, invoiceNumber, amoutDue) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Hello ${clientName},</h2>
        <p>We’re delighted to inform you that your recent invoice payment has been received.</p>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Amount Paid:</strong> R${amoutDue}</p>
        <p>Your account balance is now updated. Thank you for your prompt payment and for trusting us with your business.</p>
        <p>Best regards,<br>Web DevSolution</p>
      </div>
    </body>
  </html>
        `;
}

function generateInvoiceContent(clientName, invoiceNumber, amoutDue) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Hello ${clientName},</h2>
        <p>We’re pleased to let you know that your invoice has been successfully created.</p>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Amount Due:</strong> R${amoutDue}</p>
        <p>To view your invoice, click the button below:</p>
        <a href="#" style="padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">View Invoice</a> 
      </div>
    </body>
  </html>
        `;
}
