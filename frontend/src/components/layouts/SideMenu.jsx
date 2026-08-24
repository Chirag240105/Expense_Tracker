import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiHome, 
  HiCreditCard, 
  HiCash, 
  HiChartBar,
  HiUserCircle,
  HiCog 
} from "react-icons/hi";
import { FaBrain } from "react-icons/fa6";

function SideMenu({ activeMenu }) {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <HiHome className="text-xl" />
    },
    {
      name: 'Expense',
      path: '/expense',
      icon: <HiCreditCard className="text-xl" />
    },
    {
      name: 'Income',
      path: '/income',
      icon: <HiCash className="text-xl" />
    },
    {
      name: 'AI Insights',
      path: '/ai-insights',
      icon: <FaBrain className="text-xl" />
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <HiUserCircle className="text-xl" />
    },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">ET</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">ExpenseVerse</h2>
            <p className="text-xs text-gray-400">Track your finances</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive || activeMenu === item.name
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          >
            <HiCog className="text-xl" />
            <span className="font-medium">Settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}

export default SideMenu;
