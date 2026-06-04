import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import ResponsiveContainer from "../components/common/ResponsiveContainer";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("today");
  const [shop, setShop] = useState({});
  const [owner, setOwner] = useState({
    username: "",
    email: "",
    phone: "",
    newPassword: "",
  });

  // ---------------- ADD ERROR STATE ----------------
  const [ownerErrors, setOwnerErrors] = useState({
    email: "",
    phone: "",
    newPassword: "",
  });

  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    count: 0,
    orders: [],
  });

  const [loadingSales, setLoadingSales] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  /* ---------------------------------------------------
     MAP PRESETS → API QUERY
  --------------------------------------------------- */
  const mapRange = (range) => {
    switch (range) {
      case "today":
        return "day";
      case "yesterday":
        return "yesterday";
      case "7days":
        return "7days";
      case "30days":
        return "30days";
      case "month":
        return "month";
      case "year":
        return "year";
      default:
        return "day";
    }
  };

  /* ---------------------------------------------------
     LOAD SHOP DATA
  --------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/api/shop", {
      headers: { Authorization: token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setShop(data);
      })
      .catch((err) => Swal.fire("❌ Error", err.message, "error"));
  }, [token]);

  /* ---------------------------------------------------
     LOAD OWNER DATA
  --------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/api/user/profile", {
      headers: { Authorization: token },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);

        setOwner({
          username: data.username,
          email: data.email,
          phone: data.phone,
          newPassword: "",
        });
      })
      .catch((err) => Swal.fire("❌ Error", err.message, "error"));
  }, [token]);

  /* ---------------------------------------------------
     SALES DATA
  --------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    async function loadSales() {
      try {
        setLoadingSales(true);

        const res = await fetch(
          `http://localhost:3000/api/order/sales-summary?range=${mapRange(
            timeRange
          )}`,
          { headers: { Authorization: token } }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setSalesSummary({
          totalSales: data.totalSales,
          count: data.count,
          orders: data.orders,
        });
      } catch (err) {
        Swal.fire("❌ Error", err.message, "error");
      } finally {
        setLoadingSales(false);
      }
    }

    loadSales();
  }, [token, timeRange]);

  /* ---------------------------------------------------
     FORMAT DATE
  --------------------------------------------------- */
  const formatDateTime = (value) => {
    const d = new Date(value);
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ---------------------------------------------------
     CHART DATA
  --------------------------------------------------- */
  const chartData = useMemo(() => {
    const map = new Map();

    salesSummary.orders.forEach((order) => {
      const paid = order.paid_at || order.create_at;
      const d = new Date(paid);

      let label =
        timeRange === "year"
          ? `${String(d.getMonth() + 1).padStart(2, "0")}/${
              d.getFullYear() + 543
            }`
          : d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });

      const total = map.get(label) || 0;
      map.set(label, total + order.grand_total);
    });

    return Array.from(map.entries()).map(([label, total]) => ({
      label,
      total,
    }));
  }, [salesSummary.orders, timeRange]);

  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.total)) : 0;

  /* ---------------------------------------------------
     Toggle Switch
  --------------------------------------------------- */
  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 flex items-center rounded-full cursor-pointer transition-colors ${
        checked ? "bg-green-500" : "bg-gray-400"
      }`}
    >
      <div
        className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );

  /* ---------------------------------------------------
     OWNER VALIDATION (same as register)
  --------------------------------------------------- */
  const validateOwnerField = (name, value) => {
    let msg = "";

    if (name === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) msg = "กรุณากรอกอีเมล";
      else if (!regex.test(value)) msg = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (name === "phone") {
      if (!/^\d{10}$/.test(value)) msg = "ต้องเป็นตัวเลข 10 หลัก";
    }

    if (name === "newPassword") {
      if (!value) msg = "กรุณากรอกรหัสผ่าน";
      else if (/\s/.test(value)) msg = "ห้ามมีช่องว่าง";
      else if (value.length < 8) msg = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว";
    }

    setOwnerErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const canSaveOwner =
    !ownerErrors.email && !ownerErrors.phone && owner.email && owner.phone;

  const canResetPassword = !ownerErrors.newPassword && owner.newPassword;

  /* ---------------------------------------------------
     SAVE SHOP
  --------------------------------------------------- */
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/shop/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(shop),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      Swal.fire("อัปเดตสำเร็จ", "", "success");
      setShop(data);
    } catch (err) {
      Swal.fire("❌ Error", err.message, "error");
    }
  };

  /* ---------------------------------------------------
     SAVE OWNER
  --------------------------------------------------- */
  const handleSaveOwner = async () => {
    if (!canSaveOwner) {
      Swal.fire("กรุณากรอกข้อมูลให้ถูกต้อง", "", "warning");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/user/updateOwner/${owner.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            email: owner.email,
            phone: owner.phone,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      Swal.fire("บันทึกข้อมูล Owner สำเร็จ", "", "success");
    } catch (err) {
      Swal.fire("❌ Error", err.message, "error");
    }
  };

  /* ---------------------------------------------------
     RESET PASSWORD
  --------------------------------------------------- */
  const handleResetPassword = async () => {
    if (!canResetPassword) {
      Swal.fire("กรุณากรอกรหัสผ่านให้ถูกต้อง", "", "warning");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/user/resetPassword/${owner.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ newPassword: owner.newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      Swal.fire("รีเซ็ตรหัสผ่านสำเร็จ", "", "success");

      setOwner({ ...owner, newPassword: "" });
    } catch (err) {
      Swal.fire("❌ Error", err.message, "error");
    }
  };

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */
  return (
    <ResponsiveContainer className="p-6 h-screen overflow-hidden bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-7rem)]">
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-6 h-full">
          {/* SALES CHART */}
          <div className="bg-white p-6 rounded-xl shadow h-1/2 min-h-[260px] flex flex-col">
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-bold">กราฟยอดขาย</h3>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="today">วันนี้</option>
                <option value="yesterday">เมื่อวาน</option>
                <option value="7days">7 วันล่าสุด</option>
                <option value="30days">30 วันล่าสุด</option>
                <option value="month">เดือนนี้</option>
                <option value="year">ปีนี้</option>
              </select>
            </div>

            <p className="text-sm text-gray-500 mb-3">
              ยอดขายรวม: <b>฿{salesSummary.totalSales?.toLocaleString()}</b> |{" "}
              {salesSummary.count} บิล
            </p>

            {/* GRAPH */}
            <div className="relative w-full h-64 flex items-end px-2 select-none">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full border-t border-gray-300/30"
                  ></div>
                ))}
              </div>

              {tooltip && (
                <div
                  className="px-3 py-2 bg-white shadow-lg border rounded text-xs text-gray-700 fixed z-50 pointer-events-none"
                  style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
                >
                  <b>{tooltip.label}</b>
                  <div>฿{tooltip.total.toLocaleString()}</div>
                </div>
              )}

              {!loadingSales && chartData.length === 0 && (
                <div className="absolute inset-0 flex justify-center items-center text-gray-400">
                  ไม่มีข้อมูลยอดขาย
                </div>
              )}

              {chartData.map((item, idx) => {
                const heightPercent =
                  maxValue > 0 ? (item.total / maxValue) * 100 : 0;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center mx-1 relative"
                  >
                    <div
                      className="w-8 bg-blue-500 border border-blue-700 rounded-md shadow cursor-pointer transition-all"
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: "12px",
                      }}
                      onMouseMove={(e) =>
                        setTooltip({
                          label: item.label,
                          total: item.total,
                          x: e.clientX,
                          y: e.clientY,
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    ></div>

                    <span className="text-[10px] mt-1">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BILL TABLE */}
          <div className="bg-white p-6 rounded-xl shadow flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-3">รายการบิล</h3>

            <div className="border rounded-lg overflow-auto max-h-[300px]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="px-3 py-2">วันที่</th>
                    <th className="px-3 py-2">เลขบิล</th>
                    <th className="px-3 py-2">โต๊ะ</th>
                    <th className="px-3 py-2">ลูกค้า</th>
                    <th className="px-3 py-2 text-right">ยอดสุทธิ</th>
                    <th className="px-3 py-2">สถานะ</th>
                  </tr>
                </thead>

                <tbody>
                  {salesSummary.orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-5 text-gray-400"
                      >
                        ไม่มีรายการ
                      </td>
                    </tr>
                  ) : (
                    salesSummary.orders.map((order) => (
                      <tr key={order._id} className="border-b">
                        <td className="px-3 py-2">
                          {formatDateTime(order.paid_at || order.create_at)}
                        </td>

                        <td className="px-3 py-2">{order.transaction_id}</td>
                        <td className="px-3 py-2">{order.table_id}</td>
                        <td className="px-3 py-2">
                          {order.username || "ลูกค้า"}
                        </td>

                        <td className="px-3 py-2 text-right">
                          ฿{order.grand_total.toLocaleString()}
                        </td>

                        <td className="px-3 py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            paid
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white p-6 rounded-xl shadow overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">แก้ไขข้อมูลร้าน</h3>

          <label>
            ชื่อร้าน:
            <input
              value={shop.shop_name || ""}
              onChange={(e) => setShop({ ...shop, shop_name: e.target.value })}
              className="w-full p-2 mt-1 border rounded mb-3"
            />
          </label>

          <div className="flex gap-4 mb-3">
            <label className="flex-1">
              เวลาเปิด:
              <input
                type="time"
                value={shop.open_time || ""}
                onChange={(e) =>
                  setShop({ ...shop, open_time: e.target.value })
                }
                className="w-full p-2 mt-1 border rounded"
              />
            </label>

            <label className="flex-1">
              เวลาปิด:
              <input
                type="time"
                value={shop.close_time || ""}
                onChange={(e) =>
                  setShop({ ...shop, close_time: e.target.value })
                }
                className="w-full p-2 mt-1 border rounded"
              />
            </label>
          </div>

          <label>
            ที่อยู่:
            <textarea
              value={shop.shop_address || ""}
              onChange={(e) =>
                setShop({ ...shop, shop_address: e.target.value })
              }
              className="w-full p-2 mt-1 border rounded mb-3"
            />
          </label>

          <div className="flex items-center justify-between mb-3">
            <span>ภาษี 7%</span>
            <ToggleSwitch
              checked={shop.tax_enabled || false}
              onChange={(v) => setShop({ ...shop, tax_enabled: v })}
            />
          </div>

          <div className="flex items-center justify-between mb-3">
            <span>Service Charge</span>
            <ToggleSwitch
              checked={shop.service_charge_enabled || false}
              onChange={(v) => setShop({ ...shop, service_charge_enabled: v })}
            />
          </div>

          {shop.service_charge_enabled && (
            <label>
              อัตรา Service Charge (%):
              <input
                type="number"
                step="0.1"
                value={shop.service_charge_rate || 0}
                onChange={(e) =>
                  setShop({
                    ...shop,
                    service_charge_rate: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 mt-1 border rounded mb-3"
              />
            </label>
          )}

          <button
            onClick={handleSave}
            className="mt-4 w-full bg-button text-white rounded-lg shadow-md transition-all hover:bg-white hover:text-button flex items-center justify-center gap-2"
          >
            บันทึกข้อมูลร้าน
          </button>

          {/* OWNER SECTION */}
          <h3 className="text-xl font-bold mt-10 mb-4">แก้ไขข้อมูล Owner</h3>

          {/* EMAIL */}
          <label>
            อีเมล:
            <input
              type="email"
              value={owner.email}
              onChange={(e) => {
                const v = e.target.value.trim();
                setOwner({ ...owner, email: v });
                validateOwnerField("email", v);
              }}
              className="w-full p-2 mt-1 border rounded mb-1"
            />
            {ownerErrors.email && (
              <p className="text-red-500 text-xs">{ownerErrors.email}</p>
            )}
          </label>

          {/* PHONE */}
          <label>
            เบอร์โทร:
            <input
              type="text"
              maxLength={10}
              value={owner.phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                setOwner({ ...owner, phone: v });
                validateOwnerField("phone", v);
              }}
              className="w-full p-2 mt-1 border rounded mb-1"
            />
            {ownerErrors.phone && (
              <p className="text-red-500 text-xs">{ownerErrors.phone}</p>
            )}
          </label>

          <button
            onClick={handleSaveOwner}
            disabled={!canSaveOwner}
            className={`mt-4 w-full rounded-lg shadow-md flex items-center justify-center gap-2 py-2
             transition-all 
              ${
                canSaveOwner
                  ? "bg-button text-white hover:bg-white hover:text-button"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              }`}
          >
            บันทึกข้อมูล Owner
          </button>

          {/* RESET PASSWORD */}
          <h3 className="text-xl font-bold mt-10 mb-4">รีเซ็ตรหัสผ่าน</h3>

          <label>
            รหัสผ่านใหม่:
            <input
              type="password"
              value={owner.newPassword}
              onChange={(e) => {
                const v = e.target.value;
                setOwner({ ...owner, newPassword: v });
                validateOwnerField("newPassword", v);
              }}
              className="w-full p-2 mt-1 border rounded mb-1"
            />
            {ownerErrors.newPassword && (
              <p className="text-red-500 text-xs">{ownerErrors.newPassword}</p>
            )}
          </label>

          <button
            onClick={handleResetPassword}
            disabled={!canResetPassword}
            className={`w-full mt-2 p-2 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 
            ${
              canResetPassword
                ? "bg-red-500 text-white hover:bg-white hover:text-red-500"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Reset Password
          </button>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
