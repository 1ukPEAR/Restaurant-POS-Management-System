import React, { useState, useMemo } from "react";

export default function TableSelector({
  tables = [],
  activeTable,
  handleSelectTable,
}) {
  const [filterStatus, setFilterStatus] = useState("all"); // all | available | occupied
  const [searchCapacity, setSearchCapacity] = useState("");

  // ฟิลเตอร์โต๊ะตามสถานะ + จำนวนที่นั่ง
  const filteredTables = useMemo(() => {
    return tables
      .filter((t) => {
        if (filterStatus !== "all" && t.status !== filterStatus) return false;

        if (searchCapacity && Number(searchCapacity) > 0) {
          return t.capacity >= Number(searchCapacity);
        }

        return true;
      })
      .sort((a, b) => a.table_id.localeCompare(b.table_id));
  }, [tables, filterStatus, searchCapacity]);

  return (
    <div className="p-4 rounded-xl bg-white shadow-md font-prompt">

      {/* HEADER + FILTER + SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">

        {/* หัวข้อ */}
        <h3 className="font-semibold text-text font-prompt text-lg">
          ขั้นตอนที่ 2: เลือกโต๊ะ
        </h3>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Dropdown: Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="available">สถานะ: ว่าง</option>
            <option value="occupied">สถานะ: ไม่ว่าง</option>
          </select>

          {/* Search Capacity */}
          <input
            type="number"
            min="1"
            placeholder="จำนวนที่นั่ง เช่น 2, 4, 6"
            value={searchCapacity}
            onChange={(e) => setSearchCapacity(e.target.value)}
            className="border px-3 py-2 rounded-lg w-40 text-sm"
          />
        </div>
      </div>

      {/* TABLE LIST */}
      {filteredTables.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          ไม่พบโต๊ะที่ตรงเงื่อนไข
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTables.map((t) => {
            const isActive = activeTable === t.table_id;
            const isAvailable = t.status === "available";

            return (
              <div
                key={t.table_id}
                onClick={() => handleSelectTable(t)}
                className={`p-4 rounded-xl border cursor-pointer transition-all
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-50"
                      : isAvailable
                      ? "border-green-400 bg-green-50 hover:bg-green-100"
                      : "border-red-400 bg-red-50 hover:bg-red-100"
                  }
                `}
              >
                <div className="font-bold text-lg">{t.table_id}</div>
                <div className="text-sm text-gray-700">
                  ที่นั่ง: {t.capacity} คน
                </div>

                <div
                  className={`mt-2 px-2 py-1 rounded text-center text-xs font-semibold
                  ${
                    t.status === "available"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }
                  `}
                >
                  {t.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
