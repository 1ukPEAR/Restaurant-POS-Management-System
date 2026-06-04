import {
  UtensilsCrossed,
  CupSoda,
  CakeSlice,
  Utensils,
  List,
} from "lucide-react";

export default function CategoryList({ categories, active, onSelect }) {
  const icons = {
    all: <List size={22} />,
    food: <UtensilsCrossed size={22} />,
    drink: <CupSoda size={22} />,
    dessert: <CakeSlice size={22} />,
    other: <Utensils size={22} />,
  };

  return (
    <div className="flex gap-4 overflow-x-auto py-2 mb-6">
      {categories.map((cat) => (
        <div
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={`
            flex items-center gap-4 p-4 min-w-[220px] rounded-xl cursor-pointer border transition-all
            ${
              active === cat.value
                ? "bg-blue-50 border-primary"
                : "bg-white border-gray-200"
            }
          `}
        >
          <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
            {icons[cat.value]}
          </div>

          <div>
            <div className="font-semibold">{cat.label}</div>
            <div className="text-sm text-gray-500">{cat.count} Menu</div>
          </div>
        </div>
      ))}
    </div>
  );
}
