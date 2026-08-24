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
import uploadImage from '../../utils/uploadImage';
import toast from 'react-hot-toast';

const Signup = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const {updateUser} = useContext(UserContext);
    const navigate = useNavigate();

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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

        try {
            let profileImageUrl = "";

            // Upload image if present
            if(profileFile){
                setIsUploading(true);
                try {
                    const imgUploadRes = await uploadImage(profileFile);
                    profileImageUrl = imgUploadRes.imageUrl || "";
                } catch (uploadError) {
                    toast.error('Failed to upload profile picture');
                    console.error('Upload error:', uploadError);
                }
                setIsUploading(false);
            }

            const response = await axiosInstances.post(API_PATH.AUTH.SIGNUP, {
                username,
                email,
                password,
                profileImageUrl
            });

            const {token, user} = response.data;
            if(token){
                localStorage.setItem("token", token);
                updateUser(user);
                navigate("/dashboard");
            }
        } catch(error){
            if(error.response && error.response.data.message){
                setError(error.response.data.message);
            }else{
                setError("Something went wrong. Please try again");
            }
        }
    };

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
                {/* Profile Picture Upload */}
                <motion.div 
                    variants={formItemVariants} 
                    initial="hidden" 
                    animate="visible" 
                    className="flex flex-col items-center mb-6"
                >
                    <div className="relative group">
                        {/* Avatar Display */}
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-500 shadow-lg bg-gray-200">
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                                    <HiUserCircle className="text-white text-6xl" />
                                </div>
                            )}
                        </div>

                        {/* Hover Overlay */}
                        <label 
                            htmlFor="profile-pic-upload"
                            className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            ) : (
                                <HiPhoto className="text-white text-2xl" />
                            )}
                        </label>

                        {/* Camera Badge */}
                        <label 
                            htmlFor="profile-pic-upload" 
                            className="absolute -right-1 bottom-0 cursor-pointer rounded-full bg-green-600 p-2 text-white shadow-md transition hover:bg-green-700"
                        >
                            <HiPhoto className="h-4 w-4" />
                        </label>

                        <input
                            id="profile-pic-upload"
                            name="profile-pic-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            disabled={isUploading}
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Click to upload profile picture</p>
                </motion.div>

                {/* Name Input */}
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

                {/* Email Input */}
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

                {/* Password Input */}
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

                {/* Error Message */}
                {error && (
                    <motion.div 
                        variants={formItemVariants}
                        initial="hidden" 
                        animate="visible"
                        className="text-red-500 text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Submit Button */}
                <motion.div variants={formItemVariants} initial="hidden" animate="visible" style={{ transitionDelay: '0.3s' }}>
                    <button
                        type='submit'
                        disabled={isUploading}
                        className='mt-4 w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isUploading ? 'Uploading...' : 'Sign Up'}
                    </button>
                </motion.div>
            </form>

            {/* Login Link */}
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
