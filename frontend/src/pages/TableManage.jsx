import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import ResponsiveContainer from "../components/common/ResponsiveContainer";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import SearchBox from "../components/common/SearchBox";

import { Edit3, Trash2 } from "lucide-react";

export default function TableManage() {
  const [tables, setTables] = useState([]);
  const [searchTable, setSearchTable] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newCapacity, setNewCapacity] = useState(4);

  const [actionMenu, setActionMenu] = useState(null); // { table, x, y }

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetchTables = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/table", {
        headers: { Authorization: token },
      });
      setTables(res.data);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  useEffect(() => {
    fetchTables();

    const closeMenu = (e) => {
      if (
        !e.target.closest(".table-more-btn") &&
        !e.target.closest(".table-action-popup")
      ) {
        setActionMenu(null);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const handleAddTable = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/table/create",
        { capacity: Number(newCapacity) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      Swal.fire("✅ Success", "Add table successfully", "success");
      setOpenAddModal(false);
      setNewCapacity(4);
      fetchTables();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  const handleOpenEdit = (table) => {
    setSelectedTable(table);
    setNewCapacity(table.capacity);
    setOpenEditModal(true);
  };

  const handleEditTable = async () => {
    try {
      await axios.put(
        "http://localhost:3000/api/table/update",
        { table_id: selectedTable.table_id, capacity: Number(newCapacity) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      Swal.fire("Updated!", "Table updated successfully!", "success");
      setOpenEditModal(false);
      fetchTables();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  const handleDeleteTable = async (tableId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove the table permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete("http://localhost:3000/api/table/delete", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        data: { table_id: tableId },
      });
      Swal.fire("Deleted!", "Remove table successfully", "success");
      fetchTables();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || err.message, "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // filter ตาม search
  const filteredTables = tables.filter((t) =>
    t.table_id.toLowerCase().includes(searchTable.toLowerCase())
  );

  return (
    <ResponsiveContainer>
      <div className="mb-4">
        <h2 className="text-h2 font-prompt">Table Management</h2>
      </div>

      <div className="bg-secondary rounded-2xl shadow-card p-4">
        <div className="flex justify-end items-center gap-3 mb-4">
          <SearchBox value={searchTable} onChange={setSearchTable} />

          <button
            onClick={() => setOpenAddModal(true)}
            className="bg-button text-white px-4 py-2 rounded-lg shadow-md transition-all hover:bg-white hover:text-button flex items-center gap-2"
          >
            + Add Table
          </button>
        </div>

        {/* table grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* ⭐ เพิ่มส่วนนี้ */}
          {filteredTables.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 py-6 font-prompt">
              ยังไม่มีข้อมูลโต๊ะ
            </div>
          ) : (
            filteredTables.map((t) => (
              <div
                key={t.table_id}
                className={`relative rounded-xl p-4 shadow-md flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer ${getStatusColor(
                  t.status
                )}`}
              >
                <div className="font-semibold text-lg mb-1">{t.table_id}</div>
                <div className="text-sm font-medium capitalize mb-2">
                  {t.status}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Capacity: {t.capacity}
                </div>

                {/* จุดสามจุด */}
                <button
                  className="absolute top-2 right-2 table-more-btn text-gray-600 hover:text-black"
                  onClick={(e) => {
                    const rect = e.target.getBoundingClientRect();
                    setActionMenu({
                      table: t,
                      x: rect.right - 120,
                      y: rect.bottom + 6,
                    });
                  }}
                >
                  ⋮
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action popup */}
      {actionMenu && (
        <div
          className="table-action-popup fixed bg-white shadow-lg rounded-xl border z-50 py-2 w-36"
          style={{
            top: actionMenu.y,
            left: actionMenu.x,
          }}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition rounded-lg"
            onClick={() => {
              handleOpenEdit(actionMenu.table);
              setActionMenu(null);
            }}
          >
            <Edit3 size={16} /> Edit
          </button>

          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition rounded-lg"
            onClick={() => {
              handleDeleteTable(actionMenu.table.table_id);
              setActionMenu(null);
            }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}

      {/* Add modal */}
      {openAddModal && (
        <Modal
          open={true}
          title="Add Table"
          onClose={() => setOpenAddModal(false)}
        >
          <FormField
            label="Capacity"
            type="number"
            min="1"
            value={newCapacity}
            onChange={(v) => setNewCapacity(v)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="btn-secondary"
              onClick={() => setOpenAddModal(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAddTable}>
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {openEditModal && selectedTable && (
        <Modal
          open={true}
          title={`Edit Table ${selectedTable.table_id}`}
          onClose={() => setOpenEditModal(false)}
        >
          <FormField
            label="Capacity"
            type="number"
            min="1"
            value={newCapacity}
            onChange={(v) => setNewCapacity(v)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="btn-secondary"
              onClick={() => setOpenEditModal(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleEditTable}>
              Save
            </button>
          </div>
        </Modal>
      )}
    </ResponsiveContainer>
  );
}
