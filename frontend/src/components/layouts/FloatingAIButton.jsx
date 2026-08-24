import React from 'react';
import { FaRobot } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const FloatingAIButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/ai-insights')}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      title="AI Insights"
    >
      <FaRobot className="text-2xl text-white group-hover:animate-bounce" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
    </button>
  );
};

export default FloatingAIButton;
