import React, { useState } from 'react'

const Forgot = ({ onBack }) => {
  const [Email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden font-inter bg-gradient-to-b from-green-400 via-yellow-300 to-orange-300">
      
      {/* Background Text Layer */}
      <div className="absolute   inset-0 flex items-center justify-center">
        <h1 className="text-5xl font-extrabold  text-black tracking-widest select-none">
           TRACK YOUR EXPENSE WITH EXPENSE TRACKER
        </h1>
      </div>

      <div className="relative z-10  backdrop-blur-xl p-8 rounded-2xl shadow-xl w-[90%] max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Forgot Password
          </h2>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              value={Email}
              onChange={({ target }) => setEmail(target.value)}
              placeholder="example@mail.com"
              required
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          <button
            type="submit"
            onClick={onBack}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition"
          >
            Send OTP
          </button>

          <div className="text-center">
            <a href="/login" className="text-sm text-green-600 hover:underline">
              Back to Login
            </a>
          </div>

          <p className="text-xs text-gray-500 text-center">
            We will send a one-time password to verify your account.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Forgot;
