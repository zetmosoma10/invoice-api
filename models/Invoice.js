import mongoose from "mongoose";
import joi from "joi";
import dayjs from "dayjs";

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be an integer value",
    },
  },
  price: { type: Number, required: true, min: 0.01 },
});

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Pending", "Paid"],
      required: true,
    },
    senderAddress: {
      type: addressSchema,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    clientAddress: {
      type: addressSchema,
      required: true,
    },
    invoiceDate: { type: Date, default: Date.now },
    paidAt: Date,
    paymentTerms: {
      type: String,
      enum: ["Net 1 day", "Net 7 days", "Net 14 days", "Net 30 days"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 150,
    },
    items: [itemSchema],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const validateInvoice = (data) => {
  const addressSchema = joi.object({
    street: joi.string().required().messages({
      "string.empty": "Street is required.",
    }),
    city: joi.string().required().messages({
      "string.empty": "City is required.",
    }),
    postalCode: joi.string().required().messages({
      "string.empty": "Postal code is required.",
    }),
    country: joi.string().required().messages({
      "string.empty": "Country is required.",
    }),
  });

  const itemSchema = joi.object({
    name: joi.string().required().messages({
      "string.empty": "Item name is required.",
    }),
    quantity: joi.number().integer().positive().required().messages({
      "number.base": "Quantity must be a number.",
      "number.integer": "Quantity must be an integer.",
      "number.positive": "Quantity must be a positive number.",
      "any.required": "Quantity is required.",
    }),
    price: joi.number().positive().required().messages({
      "number.base": "Price must be a number.",
      "number.positive": "Price must be a positive number.",
      "any.required": "Price is required.",
    }),
  });

  const invoiceJoiSchema = joi.object({
    status: joi.string().valid("Draft", "Pending", "Paid").required().messages({
      "any.only": "Status terms must be one of: 'Draft', 'Pending', or 'Paid'.",
      "any.required": "Status terms are required.",
    }),
    senderAddress: addressSchema.required(),
    clientName: joi.string().min(3).max(50).required().messages({
      "string.empty": "Client name is required.",
      "string.min": "Client name must be at least 3 characters.",
      "string.max": "Client name must be no more than 50 characters.",
    }),
    clientEmail: joi.string().email().required().messages({
      "string.email": "Client email must be a valid email address.",
      "string.empty": "Client email is required.",
    }),
    invoiceDate: joi.date().default(Date.now).messages({
      "date.base": "Invoice date must be a valid date.",
    }),
    paidAt: joi.date(),
    description: joi.string().min(5).max(150).required().messages({
      "string.empty": "Project description is required.",
      "string.min": "Project description must be at least 5 characters.",
      "string.max": "Project description must be no more than 150 characters.",
    }),
    paymentTerms: joi
      .string()
      .valid("Net 1 day", "Net 7 days", "Net 14 days", "Net 30 days")
      .required()
      .messages({
        "any.only":
          "Payment terms must be one of: 'Net 1 day', 'Net 7 days', 'Net 14 days', or 'Net 30 days'.",
        "any.required": "Payment terms are required.",
      }),
    clientAddress: addressSchema.required(),
    items: joi.array().items(itemSchema).min(1).required().messages({
      "array.min": "There must be at least one item in the items list.",
    }),
  });

  const { error } = invoiceJoiSchema.validate(data);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

invoiceSchema.virtual("amountDue").get(function () {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

invoiceSchema.virtual("invoiceNumber").get(function () {
  const invoiceId = this._id.toString();
  return `#${invoiceId.slice(-4)}`;
});

invoiceSchema.virtual("paymentDue").get(function () {
  if (this.paymentTerms === "Net 1 day") {
    const paymentDue = dayjs(this.invoiceDate).add(1, "day");
    return dayjs(paymentDue).format("DD MMM, YYYY");
  }

  if (this.paymentTerms === "Net 7 days") {
    const paymentDue = dayjs(this.invoiceDate).add(7, "days");
    return dayjs(paymentDue).format("DD MMM, YYYY");
  }

  if (this.paymentTerms === "Net 14 days") {
    const paymentDue = dayjs(this.invoiceDate).add(14, "days");
    return dayjs(paymentDue).format("DD MMM, YYYY");
  }

  if (this.paymentTerms === "Net 30 days") {
    const paymentDue = dayjs(this.invoiceDate).add(1, "month");
    return dayjs(paymentDue).format("DD MMM, YYYY");
  }
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export { Invoice, validateInvoice };

/*
{
    "description": "Re-branding",
    "paymentTerms": "Net 7 days",
    "clientName": "Jensen Huang",
    "clientEmail": "jensenh@mail.com",
    "status": "Pending",
    "senderAddress": {
      "street": "19 Union Terrace",
      "city": "London",
      "postCode": "E1 3EZ",
      "country": "United Kingdom"
    },
    "clientAddress": {
      "street": "106 Kendell Street",
      "city": "Sharrington",
      "postCode": "NR24 5WQ",
      "country": "United Kingdom"
    },
    "items": [
      {
        "name": "Brand Guidelines",
        "quantity": 1,
        "price": 1800.90,
        "total": 1800.90
      }
    ]
  }
*/
