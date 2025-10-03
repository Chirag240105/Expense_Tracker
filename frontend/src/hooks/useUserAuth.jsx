import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/Context'
import { useNavigate } from 'react-router-dom';
import axiosInstances from '../utils/axiosInstances';
import { API_PATH } from '../utils/apiPath';

const useUserAuth = () => {

  const {user, updateUser,clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(()=> {
    
      if(user) return;
      let isMounted = true;
      const fetchUserInfo = async() =>{
        try{
          const response = await axiosInstances.get(API_PATH.AUTH.GET_USER_INFO);
          if (isMounted && response.data){
            updateUser(response.data)
          }
        }catch(error){
          console.error("Failed to fetch user info: ",error);
          if(isMounted){
            clearUser();
            navigate("/login");
          }
        }
      }
    fetchUserInfo();
    return () => {
   isMounted = false;
  };
  }, [user, updateUser, clearUser, navigate]);
};

export default useUserAuth;