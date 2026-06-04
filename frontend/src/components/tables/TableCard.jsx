// components/TableCard.jsx
import { useState } from "react";

export default function TableCard({ table, onEdit, onDelete }) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div
      className={`relative rounded-2xl border p-3 text-center ${
        table.status === "available"
          ? "bg-success/10"
          : "bg-error/10 text-iconDark"
      }`}
    >
      <div className="font-semibold text-base font-prompt">{table.code}</div>
      <p className="text-xs text-iconDark mb-2">Status: {table.status}</p>

      {/* Three Dots Menu */}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setOpenMenu((prev) => !prev)}
          className="p-1 rounded-full hover:bg-gray-100 transition"
        >
          <i className="bx bx-dots-vertical-rounded text-lg"></i>
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setOpenMenu(false);
                onEdit(table);
              }}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
            >
              <i className="bx bx-edit-alt"></i> Edit
            </button>
            <button
              onClick={() => {
                setOpenMenu(false);
                onDelete(table._id);
              }}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-red-600"
            >
              <i className="bx bx-trash"></i> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
