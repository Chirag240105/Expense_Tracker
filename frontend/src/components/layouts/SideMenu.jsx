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
];

function SideMenu({ activeMenu }) {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white sticky top-0 overflow-y-auto">
      <div className="p-5">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">ET</span>
          </div>
          <div>
            <h2 className="text-base font-bold">ExpenseVerse</h2>
            <p className="text-xs text-gray-400">MongoDB-powered</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive || activeMenu === item.name
                    ? "bg-green-600 text-white shadow"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profile & Settings */}
        <div className="mt-6 pt-5 border-t border-gray-700 space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <HiUserCircle className="text-xl" />
            <span className="text-sm font-medium">Profile</span>
          </NavLink>
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
          >
            <HiCog className="text-xl" />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}

export default SideMenu;
