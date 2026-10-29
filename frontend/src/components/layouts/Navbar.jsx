import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { HiUserCircle, HiMenu, HiLogout } from "react-icons/hi";
import { LuBell } from "react-icons/lu";
import { LuMoon, LuSearch, LuSun } from "react-icons/lu";
import { UserContext } from "../../context/Context.js";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import CurrencySelector from "../CurrencySelector";
import useTheme from "../../hooks/useTheme.js";

function Navbar({ activeMenu, toggleSideMenu }) {
  const navigate = useNavigate();
  const { user, clearUser } = useContext(UserContext);
  const { resolvedTheme, setThemePreference } = useTheme();
  const [userAvatar, setUserAvatar] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/transactions?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  useEffect(() => {
    fetchUserInfo();
    fetchUnreadCount();
    // Poll unread notifications every 60 s
    const timer = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.AUTH.GET_USER_INFO);
      if (res.data) setUserAvatar(res.data.profileImageUrl || null);
    } catch (error) {
      console.error("[Navbar] Could not load profile image:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.NOTIFICATIONS.LIST, {
        params: { unreadOnly: "true" },
      });
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch (error) {
      console.error("[Navbar] Could not load notification count:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post(API_PATH.AUTH.LOGOUT);
    } catch (error) {
      console.error("[Navbar] Logout request failed:", error.message);
    } finally {
      clearUser();
      navigate("/auth", { replace: true });
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSideMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
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

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {activeMenu}
            </div>

            <form onSubmit={submitSearch} className="hidden lg:flex items-center rounded-lg border border-gray-200 bg-white px-3">
              <LuSearch aria-hidden="true" className="text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search transactions"
                aria-label="Search transactions"
                className="w-40 border-0 bg-transparent px-2 py-2 text-sm outline-none"
              />
            </form>

            <button
              type="button"
              onClick={() => setThemePreference(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              {resolvedTheme === "dark" ? <LuSun size={18} /> : <LuMoon size={18} />}
            </button>

            <CurrencySelector variant="navbar" />

            {/* Notifications bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="p-2 rounded-lg hover:bg-gray-100 transition relative"
              aria-label="Notifications"
            >
              <LuBell className="text-xl text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                aria-expanded={showDropdown}
                aria-haspopup="menu"
                aria-label={`${user?.username || "User"} profile menu`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-green-500 shadow-sm">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <HiUserCircle className="text-white text-2xl" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.username || "User"}
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
                  <div role="menu" className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.username || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      role="menuitem"
                      onClick={() => { navigate("/profile"); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <HiUserCircle className="text-lg" /> My Profile
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => { navigate("/notifications"); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <LuBell className="text-lg" /> Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <HiLogout className="text-lg" /> Logout
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
