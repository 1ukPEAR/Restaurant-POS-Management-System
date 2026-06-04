// src/components/orders/BillModal.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import html2pdf from "html2pdf.js";

// PromptPay QR libs
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export default function BillModal({
  transaction,
  shopData: propShopData,
  onClose,
  onPaid,
  onCancelled,
}) {
  const billRef = useRef();
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const [shopData, setShopData] = useState(propShopData || null);

  // 📌 PromptPay Tel (ดึงจาก /shop/tel)
  const [promptPayTel, setPromptPayTel] = useState("");

  // 📌 Payment
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash | qr
  const [cashReceived, setCashReceived] = useState("");

  // 📌 QR Image
  const [qrImage, setQrImage] = useState(null);

  // 📌 Loading
  const [loadingPay, setLoadingPay] = useState(false);

  // ===========================
  // 1) โหลดเบอร์ PromptPay จาก /shop/tel
  // ===========================
  useEffect(() => {
    async function fetchTel() {
      try {
        const res = await axios.get("http://localhost:3000/api/shop/tel", {
          headers: { Authorization: token },
        });

        console.log("TEL API RESULT =", res.data);

        // ถ้า API ส่ง string ล้วน ๆ เช่น "0812345678"
        if (typeof res.data === "string") {
          setPromptPayTel(res.data.trim());
          return;
        }

        // ถ้าเป็น object ใช้ตาม field ที่มี
        const tel =
          res.data.tel ||
          res.data.phone ||
          res.data.phone_number ||
          res.data.shop_tel ||
          "";

        setPromptPayTel(tel);
      } catch (err) {
        console.error("Error fetching tel:", err);
      }
    }

    fetchTel();
  }, []);


  // ===========================
  // 2) โหลดข้อมูลร้านปกติ (ชื่อ / ที่อยู่) ถ้าต้องใช้
  // ===========================
  useEffect(() => {
    if (propShopData) {
      setShopData(propShopData);
      return;
    }

    const fetchShop = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/shop", {
          headers: { Authorization: token },
        });

        console.log("SHOP DATA:", res.data);
        setShopData(res.data);
      } catch (err) {
        console.error("fetchShop error:", err);
      }
    };

    fetchShop();
  }, [propShopData]);

  if (!transaction) return null;

  const order = transaction.order || [];

  // ===========================
  // PRICE CALCULATIONS
  // ===========================
  const itemUnitPrice = (item) =>
    Number(item.menu_price) +
    (item.menu_options || []).reduce(
      (sum, o) => sum + Number(o.option_price || 0),
      0
    );

  const itemQty = (item) => Number(item.amount || item.quantity || 0);

  const itemTotal = (item) => itemUnitPrice(item) * itemQty(item);

  const subtotal =
    typeof transaction.subtotal === "number"
      ? Number(transaction.subtotal)
      : order.reduce((s, item) => s + itemTotal(item), 0);

  const VAT_RATE = shopData?.tax_enabled ? 0.07 : 0;
  const SERVICE_RATE =
    typeof transaction.service_charge_rate === "number"
      ? transaction.service_charge_rate / 100
      : shopData?.service_charge_enabled
        ? Number(shopData.service_charge_rate) / 100
        : 0;


  const serviceAmount = +(subtotal * SERVICE_RATE).toFixed(2);
  const vatAmount = +((subtotal + serviceAmount) * VAT_RATE).toFixed(2);
  const grandTotal = +(subtotal + serviceAmount + vatAmount).toFixed(2);

  // ===========================
  // 3) GENERATE PROMPTPAY QR
  // ===========================
  useEffect(() => {
    async function buildQR() {
      setQrImage(null);

      if (paymentMethod !== "qr") return;

      if (!promptPayTel || promptPayTel.length < 9) {
        console.warn("⚠ No PromptPay Tel Loaded:", promptPayTel);
        return;
      }

      try {
        const mobile = promptPayTel.replace(/^0/, "66"); // 080 → 6680

        const payload = generatePayload(mobile, { amount: grandTotal });

        const url = await QRCode.toDataURL(payload, {
          width: 300,
          margin: 1,
        });

        setQrImage(url);
      } catch (err) {
        console.error("❌ QR Generate Error:", err);
      }
    }

    buildQR();
  }, [paymentMethod, promptPayTel, grandTotal]);

  // ===========================
  // PAY ORDER
  // ===========================
  const handlePay = async () => {
    try {
      if (paymentMethod === "cash") {
        if (!cashReceived)
          return Swal.fire("ผิดพลาด", "กรุณากรอกจำนวนเงิน", "error");

        if (Number(cashReceived) < grandTotal)
          return Swal.fire("ผิดพลาด", "เงินไม่พอ", "error");
      }

      setLoadingPay(true);

      const res = await axios.post(
        "http://localhost:3000/api/order/pay",
        {
          transaction_id: transaction.transaction_id,
          payment_method: paymentMethod,
          cash_received:
            paymentMethod === "cash" ? Number(cashReceived) : grandTotal,
        },
        { headers: { Authorization: token } }
      );

      // คืนโต๊ะ
      if (transaction.table_id) {
        await axios.put(
          "http://localhost:3000/api/table/update",
          { table_id: transaction.table_id, status: "available" },
          { headers: { Authorization: token } }
        );
      }

      setLoadingPay(false);
      onPaid && onPaid(res.data.transaction);
      onClose();

      Swal.fire("สำเร็จ", "ชำระเงินเรียบร้อย", "success");
    } catch (err) {
      setLoadingPay(false);
      Swal.fire("ผิดพลาด", err.response?.data?.error || err.message, "error");
    }
  };

  // ===========================
  // CANCEL ORDER
  // ===========================
  const handleCancel = async () => {
    const confirm = await Swal.fire({
      title: "ยืนยันยกเลิกออเดอร์?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่",
      cancelButtonText: "ไม่",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.post(
        "http://localhost:3000/api/order/cancel",
        { transaction_id: transaction.transaction_id },
        { headers: { Authorization: token } }
      );

      if (transaction.table_id) {
        await axios.put(
          "http://localhost:3000/api/table/update",
          { table_id: transaction.table_id, status: "available" },
          { headers: { Authorization: token } }
        );
      }

      onCancelled && onCancelled(res.data.transaction);
      onClose();

      Swal.fire("สำเร็จ", "ยกเลิกออเดอร์แล้ว", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error, "error");
    }
  };

  // ===========================
  // UI STARTS
  // ===========================
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">

      <div className="bg-white rounded-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">บิล #{transaction.transaction_id}</h2>
            <div className="text-sm text-gray-600">
              โต๊ะ: {transaction.table_id || "Takeaway"}
            </div>
          </div>

          <button onClick={onClose} className="text-3xl font-bold text-gray-600">&times;</button>
        </div>

        {/* Bill Content */}
        <div ref={billRef} className="p-4 border rounded-lg bg-white font-mono">

          <div className="text-center mb-3">
            <h3 className="text-lg font-bold">{shopData?.shop_name}</h3>
            <div className="text-xs text-gray-600">{shopData?.shop_address}</div>
          </div>

          <div className="text-sm mb-3">
            <div>ลูกค้า: {transaction.username || "-"}</div>
            <div>วันที่: {new Date(transaction.create_at).toLocaleString("th-TH")}</div>
          </div>

          <hr className="my-3" />

          {/* Items */}
          {order.map((item, idx) => (
            <div key={idx} className="mb-3">

              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{item.menu_name}</div>
                  {item.menu_desc && (
                    <div className="text-xs text-gray-600 italic">
                      {item.menu_desc}
                    </div>
                  )}
                  <div className="text-xs text-gray-600">
                    ราคา/หน่วย: {itemUnitPrice(item).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    จำนวน: {itemQty(item)}
                  </div>
                </div>

                <div className="font-semibold">{itemTotal(item).toFixed(2)}</div>
              </div>

              {(item.menu_options || []).length > 0 && (
                <div className="ml-4 mt-2 text-sm text-gray-700">
                  {item.menu_options.map((opt, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        • {opt.option_name} {Number(opt.option_price).toFixed(2)} ×{" "}
                        {itemQty(item)}
                      </span>
                      <span>
                        {(Number(opt.option_price) * itemQty(item)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}

          <hr className="my-3" />

          {/* Summary */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Service ({(SERVICE_RATE * 100).toFixed(0)}%)</span>
              <span>{serviceAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>VAT ({(VAT_RATE * 100).toFixed(0)}%)</span>
              <span>{vatAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Payment Section */}
        <div className="border p-3 rounded-lg bg-gray-50 mt-4">
          <h3 className="font-bold mb-2">วิธีชำระเงิน</h3>

          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`px-3 py-2 rounded-lg ${paymentMethod === "cash"
                ? "bg-blue-600 text-white"
                : "bg-gray-300"
                }`}
            >
              เงินสด
            </button>

            <button
              onClick={() => setPaymentMethod("qr")}
              className={`px-3 py-2 rounded-lg ${paymentMethod === "qr"
                ? "bg-blue-600 text-white"
                : "bg-gray-300"
                }`}
            >
              สแกนจ่าย (PromptPay)
            </button>
          </div>

          {/* Cash */}
          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <label className="font-medium">ลูกค้าจ่ายมา:</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="กรอกจำนวนเงิน"
              />

              {cashReceived && Number(cashReceived) >= grandTotal && (
                <div className="text-green-600 font-bold">
                  ทอน {(Number(cashReceived) - grandTotal).toFixed(2)} บาท
                </div>
              )}

              {cashReceived && Number(cashReceived) < grandTotal && (
                <div className="text-red-600 font-bold">เงินไม่พอ</div>
              )}
            </div>
          )}

          {/* QR */}
          {paymentMethod === "qr" && (
            <div className="text-center">
              <p className="font-bold mb-2">สแกนเพื่อชำระเงิน</p>

              {!qrImage ? (
                <p>กำลังสร้าง QR...</p>
              ) : (
                <img src={qrImage} className="mx-auto w-48" alt="PromptPay QR" />
              )}

              <p className="mt-2 text-gray-600">
                ยอดที่ต้องชำระ: {grandTotal.toFixed(2)} บาท
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={() =>
              html2pdf().from(billRef.current).set({
                filename: `bill-${transaction.transaction_id}.pdf`,
                image: { type: "jpeg", quality: 1 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4" },
              }).save()
            }
            className="w-full py-2 border rounded-lg"
          >
            ดาวน์โหลด PDF
          </button>

          <button
            onClick={handlePay}
            disabled={loadingPay}
            className="w-full py-2 bg-green-600 text-white rounded-lg"
          >
            {loadingPay ? "กำลังประมวลผล..." : "ยืนยันการชำระเงิน"}
          </button>

          <button
            onClick={handleCancel}
            className="w-full py-2 bg-red-600 text-white rounded-lg"
          >
            ยกเลิกออเดอร์
          </button>
        </div>

      </div>
    </div>
  );
}
