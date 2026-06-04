// ===============================
// ⭐ FULL FILE — MenuSelector.jsx (With Custom Note)
// ===============================

import { Search } from "lucide-react";
import { useState } from "react";
import Modal from "../common/Modal";

export default function MenuSelector({
  menuCategory,
  setMenuCategory,
  mergedMenus = {},
  filteredMenus = [],
  handleAddMenu,
  searchMenu,
  setSearchMenu,
  stepLabel = "3",
}) {
  const categories = [
    { id: "all", label: "ทั้งหมด", icon: "bx bx-grid-alt" },
    { id: "food", label: "อาหาร", icon: "bx bx-restaurant" },
    { id: "drink", label: "เครื่องดื่ม", icon: "bx bx-drink" },
    { id: "dessert", label: "ของหวาน", icon: "bx bx-cake" },
    { id: "other", label: "อื่น ๆ", icon: "bx bx-box" },
  ];

  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [customNote, setCustomNote] = useState(""); // ⭐ NOTE: ช่องข้อความ

  // ============================
  // ⭐ หากเมนูไม่มี option → เพิ่มลงตะกร้าได้ทันที
  // ============================
  const handleClickMenu = (menu) => {
    if (!menu.menu_option || menu.menu_option.length === 0) {
      handleAddMenu({
        ...menu,
        menu_options: [],
        menu_desc: "", // ไม่มีหมายเหตุ
      });
      return;
    }

    openOptionModal(menu);
  };

  const openOptionModal = (menu) => {
    setSelectedMenu(menu);

    // reset note ทุกครั้งที่เปลี่ยนเมนู
    setCustomNote("");

    const initial = {};
    menu.menu_option?.forEach((opt) => {
      initial[opt.option_id] = false;
    });
    setSelectedOptions(initial);
  };

  const toggleOption = (optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  // ============================
  // ⭐ กดเพิ่มลงตะกร้า
  // ============================
  const confirmAddMenu = () => {
    const optionsToAdd = selectedMenu.menu_option?.filter(
      (opt) => selectedOptions[opt.option_id]
    );

    handleAddMenu({
      ...selectedMenu,
      menu_options: optionsToAdd || [],
      menu_desc: customNote, // ⭐ ส่ง note เข้า cart
    });

    setSelectedMenu(null);
  };

  return (
    <div className="border rounded-2xl bg-white shadow-card p-4 font-prompt">

      {/* HEADER + SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="font-semibold text-text">
          ขั้นตอนที่ {stepLabel}: เลือกเมนูอาหาร
        </h3>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchMenu}
            onChange={(e) => setSearchMenu(e.target.value)}
            placeholder="ค้นหาเมนู..."
            className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-primary"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.map((cat) => {
          const isActive = menuCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setMenuCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-sm transition-all
                ${
                  isActive
                    ? "bg-primary text-white scale-[1.05]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <i className={`${cat.icon} text-lg`}></i>
              {cat.label}
              <span className="text-xs opacity-70">
                ({cat.id === "all" ? filteredMenus.length : mergedMenus[cat.id]?.length || 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMenus.map((m, i) => (
          <div
            key={`${m.menu_id}-${i}`}
            className="bg-white p-3 border rounded-xl shadow-sm flex flex-col"
          >
            <img
              src={m.menu_image}
              className="w-full h-24 object-cover rounded-lg mb-2"
            />

            <div className="font-semibold">{m.menu_name}</div>
            <div className="text-xs text-gray-500 flex-1">{m.menu_desc}</div>

            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-primary">฿{m.menu_price}</span>

              <button
                onClick={() => handleClickMenu(m)}
                className="bg-primary text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* OPTION MODAL */}
      <Modal
        open={!!selectedMenu}
        title={selectedMenu?.menu_name || "เลือกตัวเลือก"}
        onClose={() => setSelectedMenu(null)}
      >
        {selectedMenu && (
          <div className="flex flex-col gap-3">

            {/* ⭐ หมายเหตุ */}
            <div>
              <label className="text-sm text-gray-600">หมายเหตุเพิ่มเติม</label>
              <textarea
                className="w-full border rounded-lg p-2 mt-1 text-sm"
                placeholder="เช่น เพิ่มผัก, ไม่เอาหวาน, เผ็ดน้อย ฯลฯ"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            {/* OPTIONS */}
            {selectedMenu.menu_option?.length > 0 ? (
              <>
                {selectedMenu.menu_option.map((opt) => (
                  <label className="flex items-center gap-2" key={opt.option_id}>
                    <input
                      type="checkbox"
                      checked={selectedOptions[opt.option_id] || false}
                      onChange={() => toggleOption(opt.option_id)}
                    />
                    {opt.option_name} (+{opt.option_price} บาท)
                  </label>
                ))}

                <button
                  onClick={confirmAddMenu}
                  className="bg-primary text-white py-2 rounded-lg mt-4"
                >
                  เพิ่มลงตะกร้า
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-gray-500">เมนูนี้ไม่มีตัวเลือกเพิ่มเติม</p>

                <button
                  onClick={confirmAddMenu}
                  className="bg-primary text-white py-2 rounded-lg mt-4"
                >
                  เพิ่มลงตะกร้า
                </button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
