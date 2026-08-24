import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUserCircle, HiMenu, HiLogout } from "react-icons/hi";
import { FaBell } from "react-icons/fa";
import { UserContext } from '../../context/Context.js';
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import CurrencySelector from '../CurrencySelector';  // ADD THIS

function Navbar({ activeMenu, toggleSideMenu }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [userAvatar, setUserAvatar] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstances.get(API_PATH.AUTH.GET_USER_INFO);
      if (response.data) {
        setUserAvatar(response.data.avatar || response.data.profileImageUrl);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSideMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <HiMenu className="text-2xl text-gray-700" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                ExpenseVerse
              </h1>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Active Menu Badge */}
            <div className="hidden md:block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {activeMenu}
            </div>

            {/* Currency Selector - ADD THIS */}
            <CurrencySelector variant="navbar" />

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition relative">
              <FaBell className="text-xl text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 shadow-sm">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <HiUserCircle className="text-white text-2xl" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.username || user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.username || user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <HiUserCircle className="text-lg" />
                      My Profile
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <HiLogout className="text-lg" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
