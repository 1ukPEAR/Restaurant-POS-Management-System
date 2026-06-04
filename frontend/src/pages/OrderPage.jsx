// ==============================
// ⭐ FULL FILE — OrderPage.jsx
// ==============================
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import EatTypeSelector from "../components/food/EatTypeSelector";
import TableSelector from "../components/tables/TableSelector";
import MenuSelector from "../components/food/MenuSelector";
import BillSummary from "../components/orders/BillSummary";
import BillModal from "../components/orders/BillModal";
import ResponsiveContainer from "../components/common/ResponsiveContainer";

export default function OrderPage() {
  const [eatType, setEatType] = useState("dinein");
  const [activeTable, setActiveTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [showTables, setShowTables] = useState(true);

  const [menus, setMenus] = useState({ food: [], drink: [], dessert: [], other: [] });
  const [menuCategory, setMenuCategory] = useState("all");
  const [searchMenu, setSearchMenu] = useState("");
  const [cart, setCart] = useState([]);

  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);

  const [shopData, setShopData] = useState(null);

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  // =============================
  // FETCH TABLES
  // =============================
  const fetchTables = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/table", {
        headers: { Authorization: token },
      });
      setTables(res.data || []);
    } catch (err) {
      console.error("fetchTables", err);
    }
  };

  // =============================
  // FETCH MENU
  // =============================
  const fetchMenus = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/menu", {
        headers: { Authorization: token },
      });
      setMenus(res.data || { food: [], drink: [], dessert: [], other: [] });
    } catch (err) {
      console.error("fetchMenus", err);
    }
  };

  // =============================
  // FETCH SHOP
  // =============================
  const fetchShop = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/shop", {
        headers: { Authorization: token },
      });
      setShopData(res.data || null);
    } catch (err) {
      console.error("fetchShop", err);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchMenus();
    fetchShop();
  }, []);

  // =============================
  // MERGE MENUS
  // =============================
  const mergedMenus = useMemo(() => {
    const all = [];
    Object.keys(menus).forEach((cat) => {
      (menus[cat] || []).forEach((m) => all.push({ ...m, category: cat }));
    });
    return all;
  }, [menus]);

  const filteredMenus = useMemo(() => {
    return mergedMenus.filter((m) => {
      const matchCategory = menuCategory === "all" || m.category === menuCategory;
      const matchSearch = m.menu_name?.toLowerCase().includes(searchMenu.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [mergedMenus, menuCategory, searchMenu]);

  // =============================
  // SELECT TABLE
  // =============================
  const handleSelectTable = async (table) => {
    setActiveTable(table.table_id);
    setShowBillModal(false);
    setCart([]);

    if (table.status === "occupied") {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/order/bill",
          { table_id: table.table_id },
          {
            headers: { Authorization: token },
            validateStatus: () => true,
          }
        );

        if (res.status === 403) {
          return Swal.fire({
            icon: "warning",
            title: "ร้านปิดทำการ",
            text: res.data.error || "ร้านไม่ได้เปิดให้บริการขณะนี้",
            confirmButtonText: "โอเค",
          });
        }

        if (!res.data || !res.data.transactions) {
          return Swal.fire({
            icon: "error",
            title: "Error",
            text: "ไม่พบข้อมูลบิล",
          });
        }

        const tx = res.data.transactions[0] || null;
        setCurrentTransaction(tx);

      } catch (err) {
        console.error("load bill", err);
        Swal.fire("Error", err.message, "error");
      }

    } else {
      setCurrentTransaction(null);
    }
  };

  // =============================
  // ADD MENU TO CART
  // ⭐ FIX: เมนูไม่มี option → ไม่ error
  // =============================
  const handleAddMenu = (menu) => {
    setCart((prev) => {
      const normalized = {
        menu_id: menu.menu_id || menu._id,
        menu_name: menu.menu_name,
        menu_price: Number(menu.menu_price || 0),
        menu_desc: menu.menu_desc || "",

        menu_options: (menu.menu_options || menu.menu_option || []).map((o) => ({
          option_id: o.option_id,
          option_name: o.option_name,
          option_price: Number(o.option_price || 0),
        })),

        quantity: 1,
      };

      const key = (m) => m.menu_id + JSON.stringify(m.menu_options || []);
      const exist = prev.find((p) => key(p) === key(normalized));

      if (exist) {
        return prev.map((p) =>
          key(p) === key(normalized) ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        );
      }

      return [...prev, normalized];
    });
  };

  // =============================
  // REMOVE FROM CART
  // =============================
  const handleRemoveCartItem = (menu_id, menu_options = [], removeAll = false) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.menu_id === menu_id &&
            JSON.stringify(i.menu_options || []) === JSON.stringify(menu_options || [])
            ? removeAll
              ? null
              : { ...i, quantity: (i.quantity || 1) - 1 }
            : i
        )
        .filter(Boolean)
    );
  };

  // =============================
  // CALLED WHEN TX CREATED
  // =============================
  const handleOnTransactionCreated = async (tx) => {
    setCurrentTransaction(tx);
    await fetchTables();

    if (eatType === "takeaway") setShowBillModal(true);
  };

  // =============================
  // AFTER PAY / CANCEL
  // =============================
  const handlePaidOrCancelled = async (tx) => {
    setCurrentTransaction(null);
    setCart([]);
    setShowBillModal(false);
    await fetchTables();
  };

  // =============================
  // UI
  // =============================
  return (
    <ResponsiveContainer>
      <h2 className="text-h2 font-prompt mb-4">Order Page</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          <EatTypeSelector
            eatType={eatType}
            setEatType={(v) => {
              setEatType(v);
              setCurrentTransaction(null);
              setCart([]);
            }}
            setActiveTable={setActiveTable}
          />

          {eatType === "dinein" && (
            <TableSelector
              tables={tables}
              activeTable={activeTable}
              handleSelectTable={handleSelectTable}
              showTables={showTables}
              setShowTables={setShowTables}
            />
          )}

          {(eatType === "takeaway" || activeTable) && (
            <MenuSelector
              menuCategory={menuCategory}
              setMenuCategory={setMenuCategory}
              mergedMenus={mergedMenus}
              filteredMenus={filteredMenus}
              handleAddMenu={handleAddMenu}
              searchMenu={searchMenu}
              setSearchMenu={setSearchMenu}
            />
          )}
        </div>

        {/* RIGHT */}
        <BillSummary
          eatType={eatType}
          activeTable={activeTable}
          cart={cart}
          setCart={setCart}
          currentTransaction={currentTransaction}
          setCurrentTransaction={setCurrentTransaction}
          onTransactionCreated={handleOnTransactionCreated}
          onCheckout={() => setShowBillModal(true)}
          updateTables={fetchTables}
          setShowBillModal={setShowBillModal}
        />
      </div>

      {/* BILL MODAL */}
      {showBillModal && currentTransaction && (
        <BillModal
          transaction={currentTransaction}
          shopData={shopData}
          onClose={() => setShowBillModal(false)}
          onPaid={(tx) => {
            handlePaidOrCancelled(tx);
            Swal.fire("สำเร็จ", "ชำระเงินเรียบร้อย โต๊ะถูกปล่อยแล้ว", "success");
          }}
          onCancelled={(tx) => {
            handlePaidOrCancelled(tx);
            Swal.fire("ยกเลิกแล้ว", "ออเดอร์ถูกยกเลิกและโต๊ะว่างแล้ว", "info");
          }}
        />
      )}
    </ResponsiveContainer>
  );
}
