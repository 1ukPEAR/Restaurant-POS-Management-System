const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  option_id: String,
  option_name: String,
  option_price: Number,
});

const orderItemSchema = new mongoose.Schema({
  menu_id: String,
  menu_name: String,
  amount: Number,
  menu_price: Number,
  menu_options: [optionSchema],
  menu_desc: String,
  subtotal: Number,
});

const transactionSchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true },

    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: "shop", required: true },
    table_id: { type: String, default: null },

    username: { type: String, required: true },

    order: [orderItemSchema],

    subtotal: Number,
    service_charge_rate: Number,
    tax_rate: Number,
    tax_amount: Number,
    grand_total: Number,

    // ⭐ PAYMENT INFO ⭐
    payment_method: {
      type: String,
      enum: ["cash", "qr"],
      default: null,
    },

    cash_received: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },

    create_at: { type: Date, default: Date.now },
    paid_at: { type: Date },
  },
  { collection: "transaction" }
);

module.exports = mongoose.model("transaction", transactionSchema);
