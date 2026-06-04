import { Search } from "lucide-react";

export default function SearchBox({ value, onChange }) {
  return (
    <div
      className="
        flex items-center gap-2 
        bg-secondary 
        border border-bg 
        rounded-lg 
        px-3 py-2 
        shadow-sm
        w-full max-w-xs
        transition-all duration-150

        hover:border-primary
        focus-within:border-primary
        focus-within:ring-2
        focus-within:ring-primary/30
      "
    >
      <Search size={18} className="text-iconLight" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="
          w-full bg-transparent focus:outline-none 
          text-text placeholder-iconLight
        "
      />
    </div>
  );
}
