import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  streetAdress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId(),
    ref: "User",
    required: true,
  },
  BillFrom: {
    address: {
      type: addressSchema,
      required: true,
    },
  },
  BillTo: {
    address: {
      type: addressSchema,
      required: true,
    },
    invoiceDate: { type: Date, default: Date.now },
    paymentTerms: {
      type: String,
      enum: ["Next 1 day", "Next 7 days", "Next 14 days", "Next 30 days"],
      required: true,
    },
    projectDescription: { type: String, required: true },
    items: [itemSchema],
  },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export { Invoice };
