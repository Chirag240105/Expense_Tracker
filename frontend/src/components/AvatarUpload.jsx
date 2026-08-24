import React, { useState, useRef } from 'react';
import { HiUserCircle, HiPhoto } from "react-icons/hi2";
import uploadImage from '../utils/uploadImage';
import toast from 'react-hot-toast';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [avatar, setAvatar] = useState(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload image
      await handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      const response = await uploadImage(file);
      
      if (response.imageUrl) {
        setAvatar(response.imageUrl);
        toast.success('Avatar updated successfully!');
        
        // Callback to parent component
        if (onAvatarUpdate) {
          onAvatarUpdate(response.imageUrl);
        }
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Upload error:', error);
      setAvatar(currentAvatar); // Revert to previous avatar
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {/* Avatar Display */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-lg bg-gray-200">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
              <HiUserCircle className="text-white text-7xl" />
            </div>
          )}
        </div>

        {/* Upload Overlay on Hover */}
        <div
          onClick={handleClick}
          className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          ) : (
            <div className="text-center">
              <HiPhoto className="text-white text-3xl mx-auto mb-1" />
              <span className="text-white text-xs">Change Photo</span>
            </div>
          )}
        </div>

        {/* Camera Icon Badge */}
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <HiPhoto className="text-lg" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="mt-4 text-sm text-gray-600 text-center">
        Click to change avatar
      </p>
    </div>
  );
};

export default AvatarUpload;
