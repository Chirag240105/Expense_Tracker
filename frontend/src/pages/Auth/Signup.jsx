// src/pages/Signup/Signup.js

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';

import { motion } from 'framer-motion';
import { HiUserCircle, HiPhoto } from "react-icons/hi2";

import Input from '../../components/Inputs/input';
import { validateEmail } from '../../utils/helper';
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import { UserContext } from '../../context/Context';
//import uploadImage from '../../utils/uploadImage';


const Signup = () => {
 //   const [profilePic, setProfilePic] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    
    const {updateUser} = useContext(UserContext);
    const navigate = useNavigate();

    
   
//let profileImageUrl = ""
    const handleSignup = async (e) => {
        e.preventDefault();
        if(!username){
            setError("Please enter your name");
            return;
        }

      if(!validateEmail(email)){
                setError("Please enter a valid email address.");
                return;
            }
            
            if(!password){
                setError("Please enter the password.");
                return;
            }
            setError("");
    
           try{


            //upload image if present
            // if(profilePic){
            //     const imgUploadRes = await uploadImage(profilePic);
            //     profileImageUrl = imgUploadRes.imageUrl || "";
            // }

            const response = await axiosInstances.post(API_PATH.AUTH.SIGNUP, {
                username,
                email,
                password,
                // profileImageUrl
            });

            const {token, user} = response.data;
            if(token){
                localStorage.setItem("token", token);
                updateUser(user);
                navigate("/dashboard");
            }
           }catch(error){
                if(error.response && error.response.data.message){
                    setError(error.response.data.message);
                }else{
                    setError("Something went wrong. Please try again");
                }
           }
          
        }
    const formItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };
    
    return (
        <AuthLayout>
            
            <motion.div variants={formItemVariants} initial="hidden" animate="visible">
                <h3 className='text-3xl font-semibold text-gray-800 text-center'>Create an Account</h3>
                <p className='mt-2 text-gray-500 text-center'>Join us and start managing your expenses!</p>
            </motion.div>

            <form onSubmit={handleSignup} className="mt-8">

                            {/* <motion.div variants={formItemVariants} initial="hidden" animate="visible" className="flex flex-col items-center mb-6">
                    <div className="relative">
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                        ) : (
                            <HiUserCircle className="h-24 w-24 text-gray-300" />
                        )}
                        <label htmlFor="profile-pic-upload" className="absolute -right-2 bottom-0 cursor-pointer rounded-full bg-green-600 p-1.5 text-white shadow-md transition hover:bg-green-700">
                            <HiPhoto className="h-5 w-5" />
                           <input
    id="profile-pic-upload"
    name="profile-pic-upload"
    type="file"
    className="sr-only"
    accept="image/*"
    onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }}
/>
                        </label>
                    </div>
                </motion.div> */}

               
                <motion.div variants={formItemVariants} initial="hidden" animate="visible">
                    <Input
                        id="fullname"
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </motion.div>

                <motion.div variants={formItemVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.1s' }}>
                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </motion.div>

                <motion.div variants={formItemVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.2s' }}>
                    <Input
                        id="password"
                        label="Password"
                        type="password" 
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </motion.div>

                <motion.div variants={formItemVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.3s' }}>
                    <button
                        type='submit'
                        className='mt-4 w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                    >
                        Sign Up
                    </button>
                </motion.div>
            </form>

            
            <motion.p variants={formItemVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.4s' }} className='mt-8 text-center text-gray-500'>
                Already have an account?{' '}
                <a href='/login' className='font-semibold text-green-600 hover:underline'>
                    Log In
                </a>
            </motion.p>
        </AuthLayout>
    );
}

export default Signup;