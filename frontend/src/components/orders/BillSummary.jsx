// ========================
// ⚡ BILL SUMMARY (FULL + FIXED menu_options + MERGE ITEMS + ADD BUTTON)
// ========================
import axios from "axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function BillSummary({
  eatType,
  activeTable,
  cart,
  setCart,
  currentTransaction,
  setCurrentTransaction,
  onTransactionCreated,
  onCheckout,
  updateTables,
  setShowBillModal,
}) {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const [shopData, setShopData] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/shop", {
        headers: { Authorization: token },
      });
      setShopData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!activeTable) return;
    loadTableBill();
  }, [activeTable]);

  const loadTableBill = async () => {
    try {
      setLoadingBill(true);

      const res = await axios.post(
        "http://localhost:3000/api/order/bill",
        { table_id: activeTable },
        {
          headers: { Authorization: token },
          validateStatus: () => true,
        }
      );

      if (res.status === 403) {
        Swal.fire({
          icon: "warning",
          title: "ร้านปิดทำการ",
          text: res.data?.error || "ร้านไม่ได้เปิดให้บริการในเวลานี้",
          confirmButtonText: "โอเค",
        });
        return;
      }

      if (!res.data || !res.data.transactions) {
        Swal.fire({
          icon: "error",
          title: "ผิดพลาด",
          text: "ไม่สามารถโหลดบิลได้",
        });
        return;
      }

      const tx = res.data.transactions[0] || null;
      setCurrentTransaction(tx);
    } catch (err) {
      console.error("loadTableBill", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setLoadingBill(false);
    }
  };

  // ==========================
  //   เปรียบเทียบ options
  // ==========================
  const sameOptions = (a, b) => {
    const clean = (x) =>
      (x || []).map((o) => ({
        option_name: o.option_name,
        option_price: o.option_price,
      }));

    return JSON.stringify(clean(a)) === JSON.stringify(clean(b));
  };

  // ==========================
  //   รวมรายการใน cart
  // ==========================
  const mergeCartItems = (items) => {
    const merged = [];

    items.forEach((item) => {
      const found = merged.find(
        (m) =>
          m.menu_id === item.menu_id &&
          sameOptions(m.menu_options, item.menu_options)
      );

      if (found) {
        found.quantity = (found.quantity || 0) + (item.quantity || 0);
      } else {
        merged.push({ ...item });
      }
    });

    return merged;
  };

  // ==========================
  //   คำนวณราคา
  // ==========================
  const TAX = shopData?.tax_enabled ? Number(shopData.tax_rate) / 100 : 0;
  const SERVICE = shopData?.service_charge_enabled
    ? Number(shopData.service_charge_rate) / 100
    : 0;

  const itemUnitPrice = (item) =>
    Number(item.menu_price) +
    (item.menu_options || []).reduce(
      (s, o) => s + Number(o.option_price || 0),
      0
    );

  const itemQty = (item) => Number(item.amount ?? item.quantity ?? 0);

  const itemTotal = (item) => itemUnitPrice(item) * itemQty(item);

  const displayList =
    cart.length > 0
      ? mergeCartItems(cart)
      : currentTransaction?.order
      ? currentTransaction.order
      : [];

  const subtotal =
    cart.length > 0
      ? mergeCartItems(cart).reduce((s, item) => s + itemTotal(item), 0)
      : Number(currentTransaction?.subtotal || 0);

  const service = +(subtotal * SERVICE).toFixed(2);
  const vat = +((subtotal + service) * TAX).toFixed(2);
  const total = +(subtotal + service + vat).toFixed(2);

  // ==========================
  //  ลบเมนูจาก cart
  // ==========================
  const removeItem = (item, removeAll = false) => {
    setCart((prev) => {
      if (removeAll) {
        return prev.filter(
          (i) =>
            !(
              i.menu_id === item.menu_id &&
              sameOptions(i.menu_options, item.menu_options)
            )
        );
      }

      let removed = false;
      const result = [];

      for (const i of prev) {
        if (
          !removed &&
          i.menu_id === item.menu_id &&
          sameOptions(i.menu_options, item.menu_options)
        ) {
          if ((i.quantity || 0) > 1) {
            result.push({ ...i, quantity: i.quantity - 1 });
          }
          removed = true;
        } else {
          result.push(i);
        }
      }

      return result;
    });
  };

  // ==========================
  //  เพิ่มเมนูแบบ +1 ใหม่
  // ==========================
  const addItem = (item) => {
    setCart((prev) => [
      ...prev,
      {
        menu_id: item.menu_id,
        menu_name: item.menu_name,
        menu_price: item.menu_price,
        quantity: 1,
        menu_options: item.menu_options || [],
        menu_desc: item.menu_desc || "",
      },
    ]);
  };

  // ==========================
  //  เปิดโต๊ะ
  // ==========================
  const openTable = async () => {
    if (!cart.length)
      return Swal.fire("แจ้งเตือน", "ยังไม่มีรายการอาหาร", "info");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/order/add",
        {
          table_id: activeTable,
          username: "ลูกค้า",
          order: cart.map((i) => ({
            menu_id: i.menu_id,
            menu_name: i.menu_name,
            menu_price: Number(i.menu_price),
            amount: Number(i.quantity),
            menu_options: i.menu_options || [],
            menu_desc: i.menu_desc || "",
          })),
        },
        { headers: { Authorization: token } }
      );

      await axios.put(
        "http://localhost:3000/api/table/update",
        { table_id: activeTable, status: "occupied" },
        { headers: { Authorization: token } }
      );

      Swal.fire("สำเร็จ", "เปิดโต๊ะสำเร็จ", "success");

      const tx = res.data.transaction;
      setCurrentTransaction(tx);
      setCart([]);

      onTransactionCreated && onTransactionCreated(tx);
      updateTables && updateTables();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  // ==========================
  //  เพิ่มออเดอร์
  // ==========================
  const updateOrder = async () => {
    if (!cart.length)
      return Swal.fire("แจ้งเตือน", "ไม่มีรายการเพิ่ม", "info");

    try {
      const res = await axios.put(
        `http://localhost:3000/api/order/update/${currentTransaction.transaction_id}`,
        {
          table_id: currentTransaction.table_id,
          orderItems: cart.map((i) => ({
            menu_id: i.menu_id,
            menu_name: i.menu_name,
            menu_price: Number(i.menu_price),
            amount: Number(i.quantity),
            menu_options: i.menu_options || [],
          })),
        },
        { headers: { Authorization: token } }
      );

      Swal.fire("สำเร็จ", "อัปเดตออเดอร์แล้ว", "success");

      setCurrentTransaction(res.data.transaction);
      setCart([]);
      updateTables && updateTables();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error, "error");
    }
  };

  // ==========================
  //  takeaway
  // ==========================
  const createTakeaway = async () => {
    if (!cart.length)
      return Swal.fire("แจ้งเตือน", "ยังไม่มีเมนู", "info");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/order/add",
        {
          table_id: null,
          username: "ลูกค้า",
          order: cart.map((i) => ({
            menu_id: i.menu_id,
            menu_name: i.menu_name,
            menu_price: Number(i.menu_price),
            amount: Number(i.quantity),
            menu_options: i.menu_options || [],
          })),
        },
        { headers: { Authorization: token } }
      );

      const tx = res.data.transaction;
      setCurrentTransaction(tx);
      setCart([]);

      onTransactionCreated && onTransactionCreated(tx);
      setShowBillModal && setShowBillModal(true);
      onCheckout && onCheckout();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error, "error");
    }
  };

  // ==========================
  //  UI
  // ==========================
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg font-prompt">
      <h3 className="text-lg font-semibold mb-3">Bill Summary</h3>

      <div className="max-h-80 overflow-y-auto space-y-3">
        {displayList.map((item, i) => (
          <div key={i} className="p-3 bg-gray-50 border rounded-lg">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{item.menu_name}</div>
                {item.menu_desc && (
                  <div className="text-xs text-blue-600 italic">
                    หมายเหตุ: {item.menu_desc}
                  </div>
                )}
                <div className="text-xs text-gray-600">
                  ราคา/หน่วย: {itemUnitPrice(item).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">
                  จำนวน: {itemQty(item)}
                </div>

                {(item.menu_options || []).length > 0 && (
                  <div className="ml-4 mt-1 text-xs text-gray-600">
                    {item.menu_options.map((opt, idx) => (
                      <div key={idx}>
                        • {opt.option_name} (+{Number(opt.option_price).toFixed(2)})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="font-bold">{itemTotal(item).toFixed(2)}</div>
            </div>

            {cart.length > 0 && (
              <div className="flex gap-2 mt-2">
                <button
                  className="px-2 py-1 bg-gray-200 rounded"
                  onClick={() => removeItem(item)}
                >
                  -1
                </button>

                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={() => addItem(item)}
                >
                  +1
                </button>

                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => removeItem(item, true)}
                >
                  ลบทั้งหมด
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <hr className="my-3" />

      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Service Charge ({(SERVICE * 100).toFixed(0)}%)</span>
          <span>{service.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>VAT ({(TAX * 100).toFixed(0)}%)</span>
          <span>{vat.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>

      {eatType === "takeaway" ? (
        <button className="btn-primary w-full mt-4" onClick={createTakeaway}>
          ชำระเงินเลย
        </button>
      ) : !currentTransaction ? (
        <button className="btn-primary w-full mt-4" onClick={openTable}>
          เปิดโต๊ะ
        </button>
      ) : (
        <>
          <button className="btn-secondary w-full mt-4" onClick={updateOrder}>
            เพิ่มออเดอร์
          </button>

          <button className="btn-primary w-full mt-2" onClick={onCheckout}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
}
