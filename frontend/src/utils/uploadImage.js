// import { API_PATH } from "./apiPath";
// import axiosInstances from "./axiosInstances";

// const uploadImage = async (imageFile) => {
//     const formData = new FormData();
//     formData.append('image', imageFile);  

//     try {
//         const response = await axiosInstances.post(API_PATH.IMAGE.UPLOAD_IMAGE, formData, {
//             headers:{
//                 'Content-Type' : 'multipart/form-data',
//             },
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         throw error;
//     }
// };

// export default uploadImage;
