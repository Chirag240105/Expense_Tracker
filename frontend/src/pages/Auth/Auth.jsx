import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext.js";
import Input from "../../components/Inputs/input";
import { validateEmail } from "../../utils/helper.js";
import axiosInstance from "../../utils/axiosInstances.js";
import { API_PATH } from "../../utils/apiPath.js";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { updateUser, setAccessToken } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill from landing page "Try demo" button
  const prefill = location.state;
  const [loginEmail, setLoginEmail]       = useState(prefill?.prefillEmail    || "");
  const [loginPassword, setLoginPassword] = useState(prefill?.prefillPassword || "");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(loginEmail)) return setLoginError("Please enter a valid email address.");
    if (!loginPassword) return setLoginError("Please enter your password.");
    setLoginError("");
    setLoginLoading(true);

    try {
      const { data } = await axiosInstance.post(API_PATH.AUTH.LOGIN, {
        email: loginEmail,
        password: loginPassword,
      });

      // Backend returns { success, token, user }
      if (data.token) {
        setAccessToken(data.token);   // stores in memory + localStorage
        updateUser(data.user);
        navigate("/dashboard", { replace: true });
      } else {
        setLoginError("Login failed — no token received. Please try again.");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 401) {
        setLoginError("Incorrect email or password.");
      } else if (msg) {
        setLoginError(msg);
      } else {
        setLoginError("Could not reach the server. Check your connection.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupUsername.trim()) return setSignupError("Please enter your full name.");
    if (!validateEmail(signupEmail)) return setSignupError("Please enter a valid email address.");
    if (!signupPassword || signupPassword.length < 6)
      return setSignupError("Password must be at least 6 characters.");
    setSignupError("");
    setSignupLoading(true);

    try {
      const { data } = await axiosInstance.post(API_PATH.AUTH.SIGNUP, {
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      });

      if (data.token) {
        setAccessToken(data.token);
        updateUser(data.user);
        navigate("/dashboard", { replace: true });
      } else {
        setSignupError("Registration failed — please try again.");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 400 && msg?.includes("already")) {
        setSignupError("An account with this email already exists. Try logging in.");
      } else if (msg) {
        setSignupError(msg);
      } else {
        setSignupError("Could not reach the server. Check your connection.");
      }
    } finally {
      setSignupLoading(false);
    }
  };

  // Demo account quick-fill
  const fillDemo = () => {
    setLoginEmail("demo@expensetracker.dev");
    setLoginPassword("Demo@12345");
    setIsSignUp(false);
  };

  const slide = {
    enterFromRight: { x: "100%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitToLeft: { x: "-100%", opacity: 0 },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100 overflow-hidden">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ET</span>
            </div>
            <span className="font-bold text-gray-800">ExpenseVerse</span>
          </div>
        </div>

        <div className="bg-white/85 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-[580px] overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.div
                  key="login"
                  variants={slide}
                  initial="enterFromRight"
                  animate="center"
                  exit="exitToLeft"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 p-8 flex flex-col justify-center"
                >
                  <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
                    <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
                  </div>

                  {/* Demo badge */}
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="mb-4 w-full py-2 border-2 border-dashed border-green-300 rounded-lg text-sm text-green-700 hover:bg-green-50 transition flex items-center justify-center gap-2"
                  >
                    ⚡ Fill demo credentials
                  </button>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="demo@expensetracker.dev"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                      <Input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    {loginError && (
                      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loginLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Signing in…
                        </span>
                      ) : "Sign In"}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-500">
                    No account?{" "}
                    <button onClick={() => setIsSignUp(true)} className="font-semibold text-green-600 hover:underline">
                      Create one
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  variants={slide}
                  initial="enterFromRight"
                  animate="center"
                  exit="exitToLeft"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 p-8 flex flex-col justify-center"
                >
                  <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Create account</h1>
                    <p className="mt-1 text-sm text-gray-500">Free forever, no credit card needed</p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="Jane Doe"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                      <Input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                      />
                    </div>

                    {signupError && (
                      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {signupError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {signupLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating account…
                        </span>
                      ) : "Create Account"}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <button onClick={() => setIsSignUp(false)} className="font-semibold text-green-600 hover:underline">
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          For informational use only — not financial advice.
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(30px,-50px) scale(1.1); }
          66%       { transform: translate(-20px,20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Auth;
