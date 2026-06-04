import { MoreVertical } from "lucide-react";

export default function ItemCard({
  image,
  title,
  desc,
  price,
  category,
  categoryIcon,
  onMoreClick, // <-- รับ event จากปุ่มสามจุด
}) {
  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-lg transition-all duration-150 overflow-hidden relative">

      {/* รูปเมนู */}
      <img
        src={image}
        alt={title}
        className="h-40 w-full object-cover"
      />

      {/* เนื้อหา */}
      <div className="p-4">
        {/* บรรทัดบน: ชื่อเมนู + ปุ่ม more */}
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg leading-tight">{title}</h3>

          <button
            className="more-btn p-1 text-gray-500 hover:text-gray-800 rounded-full"
            onClick={onMoreClick}
          >
            <MoreVertical size={20} />
          </button>
        </div>

        {/* คำอธิบาย */}
        <p className="text-gray-500 text-sm mt-1 leading-snug line-clamp-2">
          {desc}
        </p>

        {/* หมวดหมู่ + ราคา */}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            {categoryIcon}
            <span className="capitalize">{category}</span>
          </div>

          <span className="text-primary font-semibold whitespace-nowrap">
            {price} THB
          </span>
        </div>
      </div>
    </div>
  );
}
