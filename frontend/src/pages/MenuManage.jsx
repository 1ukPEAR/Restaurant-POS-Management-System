import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import ResponsiveContainer from "../components/common/ResponsiveContainer";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import ItemCard from "../components/common/ItemCard";
import CategoryList from "../components/food/CategoryList";
import SearchBox from "../components/common/SearchBox";

import { MoreVertical, Edit3, Trash2 } from "lucide-react";
import { UtensilsCrossed, CupSoda, CakeSlice, Utensils } from "lucide-react";

export default function MenuManage() {
  const [data, setData] = useState({
    all: [],
    food: [],
    drink: [],
    dessert: [],
    other: [],
  });

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);

  const [draft, setDraft] = useState({
    menu_name: "",
    menu_desc: "",
    menu_price: 0,
    menu_category: "food",
    menu_image: "",
    menu_options: [],
  });

  const [actionMenu, setActionMenu] = useState(null);

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const apiUrl = "http://localhost:3000/api/menu";

  const categoryIcons = {
    food: <UtensilsCrossed size={18} />,
    drink: <CupSoda size={18} />,
    dessert: <CakeSlice size={18} />,
    other: <Utensils size={18} />,
  };

  /* ------------------ fetch menus ------------------ */
  const fetchMenus = async () => {
    try {
      const res = await fetch(`${apiUrl}/`, {
        headers: { Authorization: token },
      });
      const result = await res.json();

      const addCategory = (arr = [], cat) =>
        arr.map((m) => ({ ...m, menu_category: cat }));

      const food = addCategory(result.food, "food");
      const drink = addCategory(result.drink, "drink");
      const dessert = addCategory(result.dessert, "dessert");
      const other = addCategory(result.other, "other");

      setData({
        all: [...food, ...drink, ...dessert, ...other],
        food,
        drink,
        dessert,
        other,
      });
    } catch (err) {
      Swal.fire("Error", "โหลดเมนูไม่สำเร็จ", "error");
    }
  };

  useEffect(() => {
    fetchMenus();

    const onMouseDown = (e) => {
      if (
        e.target.closest?.(".more-btn") ||
        e.target.closest?.(".menu-action-popup")
      )
        return;
      setActionMenu(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  /* ------------------ filter + search ------------------ */
  const menus = useMemo(() => {
    return (data[category] || []).filter((m) =>
      (m.menu_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, category, search]);

  /* ------------------ categories ------------------ */
  const categories = [
    { value: "all", label: "All Menu", count: data.all.length },
    { value: "food", label: "Food", count: data.food.length },
    { value: "drink", label: "Drinks", count: data.drink.length },
    { value: "dessert", label: "Dessert", count: data.dessert.length },
    { value: "other", label: "Other", count: data.other.length },
  ];

  /* ------------------ open edit/add form ------------------ */
  const openEditForm = (menu = null) => {
    if (menu) {
      setEditing(menu);
      setDraft({
        menu_name: menu.menu_name || "",
        menu_desc: menu.menu_desc || "",
        menu_price: Number(menu.menu_price) || 0,
        menu_category: menu.menu_category || "food",
        menu_image: "",
        menu_options: menu.menu_option ? [...menu.menu_option] : [],
      });
      setPreview(menu.menu_image || null);
    } else {
      setEditing(null);
      setDraft({
        menu_name: "",
        menu_desc: "",
        menu_price: 0,
        menu_category: "food",
        menu_image: "",
        menu_options: [],
      });
      setPreview(null);
    }
    setActionMenu(null);
    setOpenForm(true);
  };

  /* ------------------ delete menu ------------------ */
  const handleDeleteMenu = async (menu) => {
    try {
      const confirm = await Swal.fire({
        title: "ลบเมนู?",
        text: menu.menu_name,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
      });
      if (!confirm.isConfirmed) return;

      const res = await fetch(`${apiUrl}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          menu_id: menu.menu_id,
          menu_category: menu.menu_category,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");

      Swal.fire("ลบสำเร็จ", "", "success");
      setActionMenu(null);
      fetchMenus();
    } catch (err) {
      Swal.fire("Error", "ลบเมนูไม่สำเร็จ", "error");
    }
  };

  /* ------------------ save menu ------------------ */
  const handleSave = async () => {
    if (!draft.menu_name?.trim()) {
      Swal.fire("Warning", "กรุณากรอกชื่อเมนู", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("menu_category", draft.menu_category || "food");
    formData.append("menu_name", draft.menu_name);
    formData.append("menu_desc", draft.menu_desc || "");
    formData.append("menu_price", draft.menu_price || 0);
    formData.append("menu_option", JSON.stringify(draft.menu_options || []));

    if (draft.menu_image instanceof File) {
      formData.append("menu_image", draft.menu_image);
    }

    try {
      Swal.fire("กำลังบันทึก...", "", "info");

      const endpoint = editing ? `${apiUrl}/update` : `${apiUrl}/add`;
      const method = editing ? "PUT" : "POST";
      if (editing) formData.append("menu_id", editing.menu_id);

      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: token },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      Swal.close();
      setOpenForm(false);
      setPreview(null);
      setEditing(null);
      fetchMenus();
      Swal.fire("สำเร็จ", "บันทึกเมนูเรียบร้อย", "success");
    } catch (err) {
      Swal.fire("Error", "เกิดข้อผิดพลาดในการบันทึก", "error");
    }
  };

  /* ------------------ add option ------------------ */
  const addOption = () => {
    setDraft((d) => ({
      ...d,
      menu_options: [
        ...(d.menu_options || []),
        { option_id: "opt-" + Date.now(), option_name: "", option_price: 0 },
      ],
    }));
  };

  return (
    <ResponsiveContainer>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-3">
        <h2 className="text-3xl font-bold">Menu Management</h2>

        <div className="flex items-center gap-3">
          <SearchBox value={search} onChange={setSearch} />

          <button
            onClick={() => openEditForm()}
            className="bg-button text-white px-4 py-2 rounded-lg shadow-md transition-all whitespace-nowrap hover:bg-white hover:text-button flex items-center gap-2"
          >
            + Add Menu
          </button>
        </div>
      </div>

      {/* Categories */}
      <CategoryList
        categories={categories}
        active={category}
        onSelect={setCategory}
      />

      {/* ------------------------------------------------------------------ */}
      {/* SHOW "ยังไม่มีข้อมูล" WHEN EMPTY */}
      {/* ------------------------------------------------------------------ */}
      {menus.length === 0 ? (
        <div className="text-center text-gray-500 py-10 font-prompt text-lg">
          ยังไม่มีเมนูในหมวดนี้
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menus.map((m) => (
            <div key={m.menu_id} className="relative">
              <ItemCard
                image={m.menu_image}
                title={m.menu_name}
                desc={m.menu_desc}
                price={m.menu_price}
                category={m.menu_category}
                categoryIcon={categoryIcons[m.menu_category]}
                onEdit={() => openEditForm(m)}
                onDelete={() => handleDeleteMenu(m)}
                onMoreClick={(e) => {
                  e?.stopPropagation?.();
                  const rect =
                    e.currentTarget.getBoundingClientRect?.() || {
                      right: e.pageX,
                      bottom: e.pageY,
                    };

                  setActionMenu({
                    menu: m,
                    x: rect.right - 120,
                    y: rect.bottom + 6,
                  });
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Action popup */}
      {actionMenu && (
        <div
          className="menu-action-popup fixed bg-white shadow-xl rounded-xl border z-50 py-2 w-36"
          style={{
            top: actionMenu.y,
            left: actionMenu.x,
          }}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={() => {
              openEditForm(actionMenu.menu);
              setActionMenu(null);
            }}
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            onClick={() => handleDeleteMenu(actionMenu.menu)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}

      {/* Modal */}
      {openForm && (
        <Modal
          open={true}
          title={editing ? "Edit Menu" : "Add Menu"}
          onClose={() => {
            setOpenForm(false);
            setPreview(null);
            setEditing(null);
          }}
        >
          <div className="max-h-[78vh] overflow-y-auto pr-2">
            <FormField
              label="Name"
              value={draft.menu_name}
              onChange={(v) => setDraft({ ...draft, menu_name: v })}
            />

            <FormField
              label="Description"
              value={draft.menu_desc}
              onChange={(v) => setDraft({ ...draft, menu_desc: v })}
            />

            <FormField
              label="Price"
              type="number"
              value={draft.menu_price}
              onChange={(v) =>
                setDraft({ ...draft, menu_price: Number(v || 0) })
              }
            />


            {/* IMAGE */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Menu Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setDraft({ ...draft, menu_image: file });
                    setPreview(URL.createObjectURL(file));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-3 rounded-lg w-full h-40 object-cover border"
                />
              )}
            </div>

            {/* OPTIONS */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Options</label>

              {(draft.menu_options || []).map((opt, i) => (
                <div key={opt.option_id ?? i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Option name"
                    value={opt.option_name}
                    onChange={(e) => {
                      const copy = [...draft.menu_options];
                      copy[i].option_name = e.target.value;
                      setDraft({ ...draft, menu_options: copy });
                    }}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />

                  <input
                    type="number"
                    value={opt.option_price}
                    onChange={(e) => {
                      const copy = [...draft.menu_options];
                      copy[i].option_price = Number(e.target.value || 0);
                      setDraft({ ...draft, menu_options: copy });
                    }}
                    className="w-24 border rounded-lg px-3 py-2"
                  />

                  <button
                    onClick={() => {
                      const copy = draft.menu_options.filter(
                        (_, idx) => idx !== i
                      );
                      setDraft({ ...draft, menu_options: copy });
                    }}
                    className="px-2 bg-red-500 text-white rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={addOption}
                className="bg-button text-white px-4 py-2 rounded-lg shadow-md transition-all hover:bg-white hover:text-button"
              >
                + Add Option
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="btn-secondary"
              onClick={() => {
                setOpenForm(false);
                setPreview(null);
                setEditing(null);
              }}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </Modal>
      )}
    </ResponsiveContainer>
  );
}
