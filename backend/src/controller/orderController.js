const transactionModel = require("../model/transactionModel.js");
const shopModel = require("../model/shopModel.js");

/* ----------------------------------------
   Helper: Generate TX ID
---------------------------------------- */
function generateTransactionId(lastTxId) {
  if (!lastTxId) return "TX-000001";
  const next = parseInt(lastTxId.split("-")[1]) + 1;
  return `TX-${next.toString().padStart(6, "0")}`;
}

/* ----------------------------------------
   FIXED calculateBill()  
   - ไม่ปัดทศนิยมระหว่างคำนวณ
   - ปัดเฉพาะตอนส่งกลับ
---------------------------------------- */
function calculateBill(orderItems, tax_enabled, tax_rate, service_enabled, service_rate) {
  let subtotal = 0;

  orderItems.forEach((item) => {
    const optionTotal = (item.menu_options || []).reduce(
      (sum, opt) => sum + Number(opt.option_price || 0),
      0
    );

    const itemSubtotal =
      (Number(item.menu_price) + optionTotal) * Number(item.amount);

    item.subtotal = itemSubtotal; // ❗ไม่ปัดที่นี่
    subtotal += itemSubtotal;
  });

  // service_rate เป็นเปอร์เซ็นต์ เช่น 10
  const service_charge = service_enabled
    ? +(subtotal * (service_rate / 100)).toFixed(2)
    : 0;

  const tax_amount = tax_enabled
    ? +((subtotal + service_charge) * (tax_rate / 100)).toFixed(2)
    : 0;

  const grand_total = subtotal + service_charge + tax_amount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    service_rate: service_enabled ? service_rate : 0,
    service_charge: Number(service_charge.toFixed(2)),
    tax_rate: tax_enabled ? tax_rate : 0,
    tax_amount: Number(tax_amount.toFixed(2)),
    grand_total: Number(grand_total.toFixed(2)),
  };
}

/* ----------------------------------------
   GET ALL transactions
---------------------------------------- */
async function getOrders(req, res) {
  try {
    const shop_id = req.user.shop_id;
    const orders = await transactionModel
      .find({ shop_id })
      .sort({ create_at: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ----------------------------------------
   CREATE ORDER
---------------------------------------- */
async function addOrder(req, res) {
  try {
    const { table_id, username, order } = req.body;

    if (!order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: "Missing order items" });
    }

    const shop_id = req.user?.shop_id;
    if (!shop_id)
      return res.status(400).json({ error: "Missing shop_id in user" });

    const shop = await shopModel.findById(shop_id);
    if (!shop) return res.status(404).json({ error: "Shop not found" });

    // sanitize items
    const sanitizedOrder = order.map((item) => ({
      ...item,
      menu_price: Number(item.menu_price),
      amount: Number(item.amount),
      menu_options: (item.menu_options || []).map((opt) => ({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_price: Number(opt.option_price || 0),
      })),
    }));

    // FIX: convert rate from percent → decimal
    const tax_rate =
      shop.tax_enabled && shop.tax_rate ? Number(shop.tax_rate) / 100 : 0;

    const service_rate =
      shop.service_charge_enabled && shop.service_charge_rate
        ? Number(shop.service_charge_rate) / 100
        : 0;

    const lastTx = await transactionModel
      .findOne({})
      .sort({ create_at: -1 });
    const transaction_id = generateTransactionId(lastTx?.transaction_id);
    const bill = calculateBill(
      sanitizedOrder,
      shop.tax_enabled,
      tax_rate,
      shop.service_charge_enabled,
      service_rate
    );

    const newTransaction = {
      transaction_id,
      shop_id,
      table_id: table_id || null,
      username: req.user.username,
      order: sanitizedOrder,
      subtotal: bill.subtotal,
      service_charge_rate: bill.service_rate,
      service_charge: bill.service_charge,
      tax_rate: bill.tax_rate,
      tax_amount: bill.tax_amount,
      grand_total: bill.grand_total,
      status: "pending",
      create_at: new Date(),
    };

    const createdTransaction = await transactionModel.create(newTransaction);

    // Update table
    // Update table
    if (table_id) {
      await shopModel.findOneAndUpdate(
        { _id: shop_id, "tables.table_id": table_id },
        { $set: { "tables.$.status": "occupied" } }
      );
    }

    res.status(201).json({
      message: "Order created successfully",
      transaction: createdTransaction,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ----------------------------------------
   UPDATE ORDER BY TABLE
---------------------------------------- */
async function updateOrderByTable(req, res) {
  try {
    const { table_id, orderItems } = req.body;

    if (!table_id || !orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing table_id or orderItems" });
    }

    const shop_id = req.user.shop_id;

    const tx = await transactionModel
      .findOne({ shop_id, table_id, status: "pending" })
      .sort({ create_at: -1 });

    if (!tx)
      return res
        .status(404)
        .json({ error: "No pending transaction found for this table" });

    const shop = await shopModel.findById(shop_id);

    // sanitize & merge
    orderItems.forEach((item) => {
      const cleanItem = {
        ...item,
        menu_price: Number(item.menu_price),
        amount: Number(item.amount),
        menu_options: (item.menu_options || []).map((opt) => ({
          option_id: opt.option_id,
          option_name: opt.option_name,
          option_price: Number(opt.option_price || 0),
        })),
      };

      const existing = tx.order.find(
        (o) =>
          o.menu_id === cleanItem.menu_id &&
          JSON.stringify(o.menu_options || []) ===
          JSON.stringify(cleanItem.menu_options || [])
      );

      if (existing) {
        existing.amount =
          Number(existing.amount) + Number(cleanItem.amount);
      } else {
        tx.order.push(cleanItem);
      }
    });

    // Convert rate
    const tax_rate =
      shop.tax_enabled && shop.tax_rate ? Number(shop.tax_rate) / 100 : 0;

    const service_rate =
      shop.service_charge_enabled && shop.service_charge_rate
        ? Number(shop.service_charge_rate) / 100
        : 0;

    // recalc
    const bill = calculateBill(
      tx.order,
      shop.tax_enabled,
      tax_rate,
      shop.service_charge_enabled,
      service_rate
    );

    tx.subtotal = bill.subtotal;
    tx.service_charge = bill.service_charge;
    tx.tax_amount = bill.tax_amount;
    tx.grand_total = bill.grand_total;

    await tx.save();

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: tx,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ----------------------------------------
   PAY ORDER
---------------------------------------- */
async function payOrder(req, res) {
  try {
    const { transaction_id, payment_method, cash_received } = req.body;

    if (!transaction_id)
      return res.status(400).json({ error: "Missing transaction_id" });

    if (!payment_method)
      return res.status(400).json({ error: "Missing payment_method" });

    const shop_id = req.user.shop_id;

    const tx = await transactionModel.findOne({ shop_id, transaction_id });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    if (payment_method === "cash") {
      if (typeof cash_received !== "number")
        return res.status(400).json({ error: "Missing cash_received" });
    }

    tx.payment_method = payment_method;
    tx.cash_received = cash_received || tx.grand_total;
    tx.status = "paid";
    tx.paid_at = new Date();

    await tx.save();

// Free table
if (tx.table_id) {
  await shopModel.findOneAndUpdate(
    { _id: shop_id, "tables.table_id": tx.table_id },
    { $set: { "tables.$.status": "available" } }
  );
}


    res.status(200).json({
      message: "Payment successful",
      transaction: tx,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ----------------------------------------
   CANCEL ORDER
---------------------------------------- */
async function cancelOrder(req, res) {
  try {
    const { transaction_id } = req.body;
    if (!transaction_id)
      return res.status(400).json({ error: "Missing transaction_id" });

    const shop_id = req.user.shop_id;

    const tx = await transactionModel.findOne({ shop_id, transaction_id });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    tx.status = "cancelled";
    await tx.save();

if (tx.table_id) {
  await shopModel.findOneAndUpdate(
    { _id: shop_id, "tables.table_id": tx.table_id },
    { $set: { "tables.$.status": "available" } }
  );
}


    res.status(200).json({
      message: "Order cancelled successfully",
      transaction: tx,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ----------------------------------------
   GET BY TABLE
---------------------------------------- */
async function getOrderByTable(req, res) {
  try {
    const { table_id } = req.body;

    if (!table_id)
      return res.status(400).json({ error: "Missing table_id" });

    const shop_id = req.user.shop_id;

    const tx = await transactionModel
      .find({ shop_id, table_id, status: "pending" })
      .sort({ create_at: -1 });

    res.status(200).json({
      transactions: tx.length ? tx : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ----------------------------------------
   SALES SUMMARY
---------------------------------------- */
async function getSalesSummary(req, res) {
  try {
    const shop_id = req.user.shop_id;
    const { range, start, end } = req.query;

    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;

      case "yesterday":
        const y = new Date();
        y.setDate(y.getDate() - 1);
        startDate = new Date(y.setHours(0, 0, 0, 0));
        endDate = new Date(y.setHours(23, 59, 59, 999));
        break;

      case "7days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;

      case "30days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;

      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;

      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date();
        break;

      case "custom":
        if (!start || !end)
          return res
            .status(400)
            .json({ error: "Missing start or end" });
        startDate = new Date(start);
        endDate = new Date(end);
        break;

      default:
        return res.status(400).json({ error: "Invalid range" });
    }

    const orders = await transactionModel.find({
      shop_id,
      status: "paid",
      paid_at: { $gte: startDate, $lte: endDate },
    });

    const totalSales = orders.reduce(
      (sum, o) => sum + (o.grand_total || 0),
      0
    );

    res.json({
      range,
      startDate,
      endDate,
      totalSales,
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ----------------------------------------
   ORDER HISTORY
---------------------------------------- */
async function getOrderHistory(req, res) {
  try {
    const shop_id = req.user.shop_id;
    const { status } = req.query;

    const filter = { shop_id };
    if (status) filter.status = status;

    const orders = await transactionModel
      .find(filter)
      .sort({ create_at: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ---------------------------------------- */

module.exports = {
  getOrders,
  addOrder,
  updateOrderByTable,
  payOrder,
  cancelOrder,
  getOrderByTable,
  getSalesSummary,
  getOrderHistory,
};
