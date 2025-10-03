// src/pages/Login/Login.js

import React, { useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/input';
import { validateEmail } from '../../utils/helper.js';
import axiosInstances from '../../utils/axiosInstances.js';
import { API_PATH } from '../../utils/apiPath.js';
import { useContext } from 'react';
import { UserContext } from '../../context/Context.js';
import Forgot from '../ForgetPass.jsx/Forgot.jsx';


const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setpassword] = useState("");
    const [error, setError] = useState(null);
    const [forgot, setForgot] = useState(false);
    const {updateUser} = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogin = async(e)=>{
        e.preventDefault();

        if(!validateEmail(email)){
            setError("Please enter a valid email address.");
            return;
        }
        
        if(!password){
            setError("Please enter the password.");
            return;
        }
        setError("");


        //login api

        try{
          const response = await axiosInstances.post(API_PATH.AUTH.LOGIN, {
            email,
            password
          });
          const {token, user} = response.data;

          if(token) {
            localStorage.setItem("token", token);
            updateUser(user);
            navigate("/dashboard");
          }
        }catch(error){
          if(error.response && error.response.data.message){
            setError(error.response.data.message);
          }else{
            setError("Something went wrong. Please try again.");
          }
        }
    }
    if(forgot){
      return <Forgot onBack={()=> setForgot(false)}/>
    }

  return (
    <AuthLayout>
      
      <div className='mb-8 text-center'>
        <h3 className='text-3xl font-semibold text-gray-800'>
          Welcome Back
        </h3>
        <p className='mt-2 text-gray-500'>
          Please enter your details to log in.
        </p>
      </div>

      <form onSubmit={handleLogin}>

        <div className='mb-6'>
          <label htmlFor='email' className='mb-2 block text-sm font-medium text-gray-700'>
            Email Address
          </label>
          <Input
            type='email'
            id='email'
            placeholder='you@example.com'
            required
            value={email}
            onChange={({target})=>setEmail(target.value)}
            className='w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200'
          />
        </div>

        
        <div className='mb-6'>
          <label htmlFor='password' className='mb-2 block text-sm font-medium text-gray-700'>
            Password
          </label>
          <Input
            type='password'
            id='password'
            placeholder='Min 8 Characters'
            required
            onChange={({target})=>setpassword(target.value)}
            className='w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200'
          />
        </div>

        <div className='mb-6 text-right'>
          <a href="/Forgot-password" className='text-sm text-green-600 hover:underline'>
            Forgot password?
          </a>
        </div>

        <button
          type='submit'

          className='w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
        >
          Log In
        </button>
      </form>

      {/* Sign-up Link */}
      <p className='mt-8 text-center text-gray-500'>
        Don't have an account?{' '}
        <a href='/signup' className='font-semibold text-green-600 hover:underline'>
          Sign Up
        </a>
      </p>
    </AuthLayout>
  
  );
};

export default Login;