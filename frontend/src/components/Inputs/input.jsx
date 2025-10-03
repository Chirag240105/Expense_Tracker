// src/components/Input.js

import React, { useState } from 'react';
// Import the eye icons from Heroicons
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const Input = ({ value, onChange, placeholder, label, type, id }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Determine the actual input type
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="mb-6">
      <label 
        htmlFor={id} 
        className="mb-2 block text-sm font-medium text-black"
      >
        {label}
      </label>
      
      
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 transition duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
          value={value}
          onChange={onChange} // Simplified the onChange handler
        />
        
        {/* Only show the icon button if the original type is 'password' */}
        {type === 'password' && (
          <button
            type="button" // Important to prevent form submission
            onClick={toggleShowPassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {!showPassword ? (
              <FaRegEyeSlash className="h-5 w-5" />
            ) : (
              <FaRegEye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;