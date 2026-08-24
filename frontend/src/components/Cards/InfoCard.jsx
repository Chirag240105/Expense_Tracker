import React from 'react';

const InfoCard = ({ icon, label, value, onSeeMore, color = 'bg-blue-500' }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg text-2xl`}>
          {icon}
        </div>
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-2">{label}</h3>
      <p className="text-2xl font-bold text-gray-800 mb-4">{value}</p>
      
      {onSeeMore && (
        <button
          onClick={onSeeMore}
          className="text-sm text-green-600 hover:text-green-700 font-semibold hover:underline"
        >
          See Details →
        </button>
      )}
    </div>
  );
};

export default InfoCard;
