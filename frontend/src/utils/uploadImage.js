import { API_PATH, BASE_URL } from "./apiPath";
import axiosInstances from "./axiosInstances";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
        const response = await axiosInstances.post(API_PATH.FILES.UPLOAD, formData);
        const fileId = response.data?.data?.fileId;
        if (!fileId) throw new Error("Upload succeeded without a file ID");
        return { imageUrl: `${BASE_URL}${API_PATH.FILES.STREAM(fileId)}` };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export default uploadImage;
