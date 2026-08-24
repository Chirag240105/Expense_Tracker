import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/Context.js';
import Input from '../../components/Inputs/input';
import { validateEmail } from '../../utils/helper.js';
import axiosInstances from '../../utils/axiosInstances.js';
import { API_PATH } from '../../utils/apiPath.js';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  // Signup State
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(loginEmail)) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    
    if (!loginPassword) {
      setLoginError("Please enter the password.");
      return;
    }
    setLoginError("");

    try {
      const response = await axiosInstances.post(API_PATH.AUTH.LOGIN, {
        email: loginEmail,
        password: loginPassword
      });
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError("Something went wrong. Please try again.");
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!signupUsername) {
      setSignupError("Please enter your name");
      return;
    }

    if (!validateEmail(signupEmail)) {
      setSignupError("Please enter a valid email address.");
      return;
    }
    
    if (!signupPassword) {
      setSignupError("Please enter the password.");
      return;
    }
    setSignupError("");

    try {
      const response = await axiosInstances.post(API_PATH.AUTH.SIGNUP, {
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
      });

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setSignupError(error.response.data.message);
      } else {
        setSignupError("Something went wrong. Please try again");
      }
    }
  };

  const slideVariants = {
    enterFromRight: {
      x: '100%',
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exitToLeft: {
      x: '-100%',
      opacity: 0,
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-green-200 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-[600px] overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.div
                  key="login"
                  variants={slideVariants}
                  initial="enterFromRight"
                  animate="center"
                  exit="exitToLeft"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 p-8"
                >
                  {/* Login Form */}
                  <div className="h-full flex flex-col justify-center">
                    <div className="mb-8 text-center">
                      <h3 className="text-3xl font-semibold text-gray-800">Welcome Back</h3>
                      <p className="mt-2 text-gray-500">Please enter your details to log in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                      <div>
                        <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          id="login-email"
                          placeholder="you@example.com"
                          required
                          value={loginEmail}
                          onChange={({ target }) => setLoginEmail(target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <Input
                          type="password"
                          id="login-password"
                          placeholder="Min 8 Characters"
                          required
                          value={loginPassword}
                          onChange={({ target }) => setLoginPassword(target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                        />
                      </div>

                      {loginError && (
                        <div className="text-red-500 text-sm">{loginError}</div>
                      )}

                      <div className="text-right">
                        <a href="/forgot-password" className="text-sm text-green-600 hover:underline">
                          Forgot password?
                        </a>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Log In
                      </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setIsSignUp(true)}
                        className="font-semibold text-green-600 hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  variants={slideVariants}
                  initial="enterFromRight"
                  animate="center"
                  exit="exitToLeft"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 p-8"
                >
                  {/* Signup Form */}
                  <div className="h-full flex flex-col justify-center">
                    <div className="mb-6 text-center">
                      <h3 className="text-3xl font-semibold text-gray-800">Create an Account</h3>
                      <p className="mt-2 text-gray-500">Join us and start managing your expenses!</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                      <div>
                        <Input
                          id="signup-fullname"
                          label="Full Name"
                          type="text"
                          placeholder="John Doe"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                        />
                      </div>

                      <div>
                        <Input
                          id="signup-email"
                          label="Email Address"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <Input
                          id="signup-password"
                          label="Password"
                          type="password"
                          placeholder="Create a strong password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                        />
                      </div>

                      {signupError && (
                        <div className="text-red-500 text-sm">{signupError}</div>
                      )}

                      <button
                        type="submit"
                        className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Sign Up
                      </button>
                    </form>

                    <p className="mt-6 text-center text-gray-500">
                      Already have an account?{' '}
                      <button
                        onClick={() => setIsSignUp(false)}
                        className="font-semibold text-green-600 hover:underline"
                      >
                        Log In
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Auth;
