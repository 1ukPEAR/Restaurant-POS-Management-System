export default function EatTypeSelector({ eatType, setEatType, setActiveTable }) {
  const options = [
    { id: "dinein", label: "ทานที่ร้าน", icon: "bx bx-restaurant" },
    { id: "takeaway", label: "กลับบ้าน", icon: "bx bx-shopping-bag" },
  ];

  return (
    <div className="border rounded-2xl bg-white shadow-card p-4">
      <h3 className="font-semibold text-text font-prompt mb-3">
        ขั้นตอนที่ 1: เลือกรูปแบบการรับประทาน
      </h3>
      <div className="flex gap-3">
        {options.map((option) => {
          const isActive = eatType === option.id;
          return (
            <div
              key={option.id}
              onClick={() => {
                setEatType(option.id);
                if (option.id === "takeaway") setActiveTable("กลับบ้าน");
                else setActiveTable(null);
              }}
              className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all font-prompt shadow-sm ${
                isActive
                  ? "bg-primary text-white border-primary scale-[1.02]"
                  : "bg-white hover:bg-gray-50 border-gray-200"
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-2xl ${
                  isActive ? "bg-white text-button" : "bg-gray-100 text-gray-700"
                }`}
              >
                <i className={option.icon}></i>
              </div>
              <span className="font-semibold text-base">{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
