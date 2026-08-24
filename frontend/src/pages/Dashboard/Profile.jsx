import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import useUserAuth from '../../hooks/useUserAuth';
import { HiUserCircle, HiPhoto } from "react-icons/hi2";
import { FaEdit, FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { BiMoney } from "react-icons/bi";
import uploadImage from '../../utils/uploadImage';
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import toast from 'react-hot-toast';
import CurrencySelector from '../../components/CurrencySelector';
import { useCurrency } from '../../context/CurrencyContext';

const Profile = () => {
  const { user, updateUser } = useUserAuth();
  const { selectedCurrency, getCurrencySymbol } = useCurrency();
  const fileInputRef = useRef(null);

  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstances.get(API_PATH.AUTH.GET_USER_INFO);
      if (response.data) {
        setUserInfo(response.data);
        setAvatar(response.data.avatar || response.data.profileImageUrl);
        setFormData({
          username: response.data.username || response.data.name || '',
          email: response.data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

     
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);

      
      await handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      const response = await uploadImage(file);
      
      if (response.imageUrl) {
       
        await axiosInstances.put(API_PATH.AUTH.UPDATE_PROFILE, {
          profileImageUrl: response.imageUrl
        });

        setAvatar(response.imageUrl);
        toast.success('Avatar updated successfully!');
        
      
        fetchUserInfo();
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Upload error:', error);
      setAvatar(userInfo.avatar); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axiosInstances.put(API_PATH.AUTH.UPDATE_PROFILE, formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchUserInfo();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: userInfo.username || userInfo.name || '',
      email: userInfo.email || ''
    });
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="my-5 mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          <div className="h-32 bg-gradient-to-r from-green-400 via-green-500 to-green-600 relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -top-20 -left-20"></div>
              <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -bottom-20 -right-20"></div>
            </div>
          </div>

          <div className="px-8 pb-8">
           
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="relative group">
               
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-200">
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

                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                  ) : (
                    <div className="text-center">
                      <HiPhoto className="text-white text-3xl mx-auto mb-1" />
                      <span className="text-white text-xs font-semibold">Change Photo</span>
                    </div>
                  )}
                </div>

               
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white"
                  type="button"
                >
                  <HiPhoto className="text-lg" />
                </button>
              </div>

             
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="mt-4 text-sm text-gray-600 text-center">
                Click to change your profile picture
              </p>
            </div>

            
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  />
                </div>

               
                <div>
                  <CurrencySelector variant="profile" />
                  <p className="mt-2 text-xs text-gray-500">
                    All amounts will be displayed in {selectedCurrency}
                  </p>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                    >
                      <FaSave /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
                    >
                      <MdCancel /> Cancel
                    </button>
                  </div>
                )}
              </form>

             
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-2">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Member since</p>
                    <p className="font-semibold text-gray-800">
                      {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Status</p>
                    <p className="font-semibold text-green-600">Active</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <BiMoney className="text-blue-600 text-2xl mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Currency Preference</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Your selected currency: <span className="font-bold text-gray-800">{selectedCurrency} ({getCurrencySymbol()})</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Exchange rates are updated hourly. All your expenses, income, and balances will be automatically converted to your preferred currency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
