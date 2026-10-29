import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/Context.js';
import Navbar from './Navbar.jsx';
import SideMenu from './SideMenu.jsx';
import FloatingAIButton from './FloatingAIButton.jsx'; // ADD THIS IMPORT

function DashboardLayout({ children, activeMenu }) {
  const { user } = useContext(UserContext);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeMenu={activeMenu} toggleSideMenu={() => setSideMenuOpen(!sideMenuOpen)} />

      {user && (
        <div className="flex">
          {/* Desktop Sidebar */}
          <div className={`hidden shrink-0 transition-[width] duration-200 md:block ${sidebarCollapsed ? "w-20" : "w-64"}`}>
            <SideMenu
              activeMenu={activeMenu}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((current) => !current)}
            />
          </div>

          {/* Mobile Sidebar */}
          {sideMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden" role="presentation">
              <button
                type="button"
                aria-label="Close navigation menu"
                className="absolute inset-0 h-full w-full bg-black/50"
                onClick={() => setSideMenuOpen(false)}
              />
              <div className="relative z-10 h-full w-64 bg-gray-800">
                <SideMenu activeMenu={activeMenu} onNavigate={() => setSideMenuOpen(false)} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="min-w-0 flex-grow p-4 sm:p-6">
            {children}
          </main>
        </div>
      )}

      {user && <FloatingAIButton />}
    </div>
  );
}

export default DashboardLayout;
