import { useState } from "react";
import { NavLink } from "react-router-dom";

import Logo from "../../assets/logo/logo1.png";
import { useAuth } from "../../context/AuthContext";
import { routesByRole } from "../../routes/routesConfig";
import {
  LayoutDashboard,
  Users,
  Table,
  UtensilsCrossed,
  ShoppingBag,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const icons = {
  Dashboard: <LayoutDashboard size={20} />,
  Users: <Users size={20} />,
  Tables: <Table size={20} />,
  Menus: <UtensilsCrossed size={20} />,
  Order: <ShoppingBag size={20} />,
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const routes = routesByRole[user.role] ?? [];

  return (
    <>
      {/* mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white border rounded-md shadow-sm"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-md flex flex-col z-30
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo (เหมือนอันเก่า) */}
        <div className="flex justify-center mt-6 mb-8">
          <div className="w-3/5">
            <img src={Logo} alt="Logo" />
          </div>
        </div>

        {/* Menu list (ตรงกลางเหมือนของเก่า) */}
        <ul className="flex flex-col gap-2 flex-1 overflow-y-auto px-3 mb-4">
          {routes.map((r) => (
            <li key={r.path}>
              <NavLink
                to={r.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                  }`
                }
              >
                {icons[r.label] || <span>•</span>}
                <span className="text-sm font-medium">{r.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* bottom user info */}
        <div className="border-t p-4 flex items-center">
          <div className="w-6 h-6 bg-primary rounded-full"></div>

          <div className="ml-3 leading-tight">
            <div className="text-sm font-medium text-gray-800">
              {user.username ?? user.email}
            </div>
            <div className="text-xs text-gray-400">{user.role}</div>
          </div>

          <button
            onClick={logout}
            className="ml-auto text-gray-400 hover:text-primary transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>
    </>
  );
}
