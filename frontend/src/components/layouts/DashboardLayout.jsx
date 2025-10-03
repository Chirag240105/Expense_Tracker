import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/Context.js';
import Navbar from './Navbar.jsx';
import SideMenu from './SideMenu.jsx';

function DashboardLayout({ children, activeMenu }) {
  const { user } = useContext(UserContext);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  return (
    <div className="bg-gray-100  min-h-screen">
      <Navbar activeMenu={activeMenu} toggleSideMenu={() => setSideMenuOpen(!sideMenuOpen)} />

      {user && (
        <div className="flex">
        
          <div className="hidden  md:block">
            <SideMenu activeMenu={activeMenu} />
          </div>

        
          {sideMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
              <div className="absolute left-0 top-0 w-64 h-full bg-gray-800">
                <SideMenu activeMenu={activeMenu} />
              </div>
              <div
                className="w-full h-full"
                onClick={() => setSideMenuOpen(false)}
              />
            </div>
          )}

          
          <main className="flex-grow p-6">
            {children}
          </main>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
