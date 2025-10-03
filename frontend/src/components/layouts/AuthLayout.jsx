
import React from 'react';
import Lottie from 'lottie-react';
import expenseAni from '../../assets/Isometric data analysis.json';
import { motion } from 'framer-motion'; // Import motion

const AuthLayout = ({ children }) => {
  return (
    <div className='flex min-h-screen'>
      <div className='relative hidden flex-1 items-center justify-center bg-gray-900 text-white lg:flex'>
        <div 
          className='absolute inset-0 z-0 bg-cover bg-center'
        >
          <Lottie animationData={expenseAni} loop={true} autoPlay={true}/>
        </div>
        <div className='absolute inset-0 z-10  opacity-80'></div>
        
        <div className='relative z-20 mx-auto max-w-md text-center'>

          <h2 className='text-5xl font-bold tracking-wide'>
            Start Your Journey
          </h2>
          <p className='mt-4 text-lg italic leading-relaxed text-gray-200'>
            "The secret of getting ahead is getting started."
          </p>
          <p className='mt-2 text-right text-gray-300'>- Mark Twain</p>
        </div>
      </div>


      <div className='flex flex-1 items-center justify-center bg-gray-100 p-6 sm:p-12'>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-md rounded-xl bg-white p-8 shadow-xl sm:p-12'
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;