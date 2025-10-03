import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstances = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers:{
        "Content-Type":"application/json",
        Accept: "application/json"
    },
});

// automatically add token rather than manully
axiosInstances.interceptors.request.use(
    (config) =>{
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstances.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if(error.response){
        if(error.response.status === 401){
            window.location.href = "/login";
        }else if(error.response.status === 500){
            console.error("Server error. Please try again later.");
        }
    }else if(error.code === "ECONNABORTED"){
            console.error("Request timeout. Please try again.");
        }
        return Promise.reject(error);
  }
);
export default axiosInstances;