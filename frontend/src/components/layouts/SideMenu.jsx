import React from "react";
import { NavLink } from "react-router-dom";
import {
  HiHome,
  HiCreditCard,
  HiCash,
  HiUserCircle,
  HiCog,
} from "react-icons/hi";
import {
  LuLayoutList,
  LuTarget,
  LuChartBar,
  LuBell,
  LuRepeat2,
  LuTag,
  LuMapPin,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu";



const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <HiHome className="text-xl" /> },
  { name: "Transactions", path: "/transactions", icon: <LuLayoutList className="text-xl" /> },
  { name: "Income", path: "/income", icon: <HiCash className="text-xl" /> },
  { name: "Expense", path: "/expense", icon: <HiCreditCard className="text-xl" /> },
  { name: "Budgets", path: "/budgets", icon: <LuTarget className="text-xl" /> },
  { name: "Goals", path: "/goals", icon: <LuTarget className="text-xl" /> },
  { name: "Categories", path: "/categories", icon: <LuTag className="text-xl" /> },
  { name: "Analytics", path: "/analytics", icon: <LuChartBar className="text-xl" /> },
  { name: "Recurring", path: "/recurring-rules", icon: <LuRepeat2 className="text-xl" /> },
  { name: "Notifications", path: "/notifications", icon: <LuBell className="text-xl" /> },
  { name: "Nearby", path: "/nearby", icon: <LuMapPin className="text-xl" /> },
];

function SideMenu({ activeMenu, collapsed = false, onToggle, onNavigate }) {
  return (
    <aside className="sticky top-0 h-screen w-full overflow-y-auto bg-gray-800 text-white">
      <div className={collapsed ? "p-3" : "p-5"}>
        {/* Logo */}
        <div className={`mb-6 flex items-center border-b border-gray-700 pb-5 ${collapsed ? "flex-col" : "gap-3"}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">ET</span>
          </div>
          {!collapsed && <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold">ExpenseVerse</h2>
            <p className="text-xs text-gray-400">MongoDB-powered</p>
          </div>}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="rounded-lg p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {collapsed ? <LuPanelLeftOpen size={18} /> : <LuPanelLeftClose size={18} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1" aria-label="Primary navigation">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg py-2.5 transition-all duration-150 ${collapsed ? "justify-center px-2" : "gap-3 px-4"} ${
                  isActive || activeMenu === item.name
                    ? "bg-green-600 text-white shadow"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              {item.icon}
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Profile & Settings */}
        <div className="mt-6 space-y-1 border-t border-gray-700 pt-5">
          <NavLink
            to="/profile"
            onClick={onNavigate}
            title={collapsed ? "Profile" : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg py-2.5 transition-all ${collapsed ? "justify-center px-2" : "gap-3 px-4"} ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <HiUserCircle className="text-xl" />
            {!collapsed && <span className="text-sm font-medium">Profile</span>}
          </NavLink>
          <NavLink
            to="/settings"
            onClick={onNavigate}
            title={collapsed ? "Settings" : undefined}
            className={`flex items-center rounded-lg py-2.5 text-gray-300 transition-all hover:bg-gray-700 hover:text-white ${collapsed ? "justify-center px-2" : "gap-3 px-4"}`}
          >
            <HiCog className="text-xl" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </NavLink>
        </div>
      </div>
    </aside>
  );
}

export default SideMenu;
