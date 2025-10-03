import React from 'react';

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex items-center gap-6 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      
      <div
        className={`flex items-center justify-center w-14 h-14 text-2xl text-white ${color} rounded-full shadow-lg`}
      >
        {icon}
      </div>

      <div>
        <h6 className="text-sm font-medium text-gray-500 mb-1">{label}</h6>
        <span className="text-xl font-semibold text-gray-800">₹{value}</span>
      </div>
    </div>
  );
};

export default InfoCard;
