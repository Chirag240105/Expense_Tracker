import React, { useContext } from 'react';
import { UserContext } from '../../context/Context';
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_DATA } from '../../utils/data';
import avata from "../../assets/avata.png"
const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        <img
          className="w-20 h-20 rounded-full bg-slate-400"
          src={avata}
          alt="User Avatar"
        />
        <h5 className="text-gray-950 font-medium leading-6">{user?.username || "User"}</h5>
      </div>

    
        {SIDE_MENU_DATA.map((item, index) => (
          <button
            key={`menu_${index}`}
            onClick={() => handleClick(item.path)}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu === item.label
                ? 'text-white bg-blue-800'
                : ''} py-3 px-6 rounded-lg mb-3`}
          >
            <item.icon className=''/>
            {item.label}
          </button>
        ))}

        
      
    </div>
  );
};

export default SideMenu;
