"use client"
import { useAuth } from '@/components/hooks/authProvider';
import api from '@/lib/axios';
import { getAvatarUrl } from '@/lib/utils';
import Image from 'next/image'
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';



export default function Settings() {
  const {user} = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bioLength, setBioLength] = useState(user?.bio?.length || 0);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [github, setGithub] = useState(user?.github || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalAvatar = getAvatarUrl(user?.avatar);

  const isFormValid = firstName.trim() !== '' && lastName.trim() !== '' && bio.trim() !== '';
  // User is Google-only if they have Google but no local password yet
  const isGoogleOnly = user?.authProvider?.includes('google') && !user.authProvider?.includes('local');
  const canChangePassword = !isGoogleOnly;
  const isPasswordFormValid = canChangePassword
    && newPassword.trim() !== ''
    && confirmPassword.trim() !== ''
    && newPassword === confirmPassword
    && newPassword.length >= 8
    && currentPassword.trim() !== '';
  const isTwoFactorBlocked = isGoogleOnly;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDisplayedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setDisplayedImage(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBio(value);
    setBioLength(value.length);
  };

  const handleSaveAvatar = async () => {
    if (!uploadedFile) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const avatarRes = await api.post('/settings/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update avatar in user state with cache-busting timestamp
      if (avatarRes.data?.avatar || avatarRes.data?.avatarUrl) {
        const raw = avatarRes.data.avatarUrl || avatarRes.data.avatar;
        const baseUrl = getAvatarUrl(raw);
        const timestamp = new Date().getTime();
        const newAvatarUrl = `${baseUrl}?t=${timestamp}`;

        useAuth.getState().updateUser({ avatar: newAvatarUrl });

        // Keep showing the newly uploaded image in the UI immediately
        setDisplayedImage(newAvatarUrl);
      }
      
      toast.success('Avatar uploaded successfully!');
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Update profile info only (avatar is now handled separately)
      const res = await api.put('/settings/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        github: github.trim(),
        instagram: instagram.trim(),
      });
      
      if (res.data?.user) {
        useAuth.getState().setAuth(res.data.user, useAuth.getState().accessToken || '');
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canChangePassword) {
      toast.error('Password login is disabled for Google-only accounts.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    try {
      await api.put('/settings/password', {
        currentPassword,
        newPassword,
      });
      
      toast.success('Password changed successfully!');
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleToggle2FA = async () => {
    if (isTwoFactorBlocked) {
      toast.error('Two-Factor Authentication is unavailable for Google-only sign-in.');
      return;
    }

    try {
      const res = await api.put('/settings/2fa', {
        enabled: !twoFactorEnabled,
      });
      
      if (res.data?.user) {
        useAuth.getState().setAuth(res.data.user, useAuth.getState().accessToken || '');
        setTwoFactorEnabled(res.data.enabled);
        toast.success(res.data.message || (res.data.enabled ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled'));
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to toggle 2FA');
    }
  };

    return (
      <div className="h-[calc(100%-232px)] flex gap-10 flex-col items-center justify-start pt-6 px-10 overflow-y-auto">
        <div className="card w-full py-10 h-fit opacity-70 gap-5 flex flex-col items-center px-10">
          <div className="flex flex-col gap-3 self-start w-full">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p>Manage your account settings and preferences.</p>
          </div>
          <div className="w-full h-[2px] bg-gradient-to-r from-purple-nave to-purple-400 my-2"></div>
          
          {/* Profile Picture Section - Always Visible */}
          <Image
          className="self-start rounded-full w-45 h-45"
           src={displayedImage || originalAvatar}
           alt="profile image"
           width={500} 
           height={500}
           priority
           unoptimized
           key={user?.avatar}/>
           <div className="w-full flex h-fit items-center justify-between self-start">
            <p className="text-lg ml-5 font-semibold self-center ">Profile picture</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-x-2">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {!uploadedFile ? (
                      <>
                        <button 
                          type="button" 
                          onClick={handleUploadClick}
                          className="py-2 px-3 inline-flex items-center 
                          gap-x-2 text-xs font-medium rounded-lg border border-transparent 
                          bg-purple-nave text-white hover:bg-blue-700 focus:outline-hidden 
                          focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" x2="12" y1="3" y2="15"></line>
                          </svg>
                          Upload photo
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          type="button" 
                          onClick={handleSaveAvatar}
                          disabled={isUploadingAvatar}
                          className="py-2 px-3 inline-flex items-center 
                          gap-x-2 text-xs font-medium rounded-lg border border-transparent 
                          bg-green-600 text-white hover:bg-green-700 focus:outline-hidden 
                          focus:bg-green-700 disabled:opacity-50 disabled:pointer-events-none">
                          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          {isUploadingAvatar ? 'Saving...' : 'Save Avatar'}
                        </button>
                        <button 
                          type="button" 
                          onClick={handleDelete}
                          disabled={isUploadingAvatar}
                          className="py-2 px-3 inline-flex items-center 
                          gap-x-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-500 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 
                          dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
                            Cancel
                          </button>
                      </>
                    )}
                  </div>
                </div>
           </div>
          <div className="w-full h-[2px] bg-gradient-to-r from-purple-nave to-purple-400 my-2"></div>
          
          {/* Tab Navigation - Full Width Split */}
          <div className="w-full relative bg-ligth-white dark:bg-dark-purple p-1 rounded-full border border-gray-300 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-2 relative">
              {activeTab === 'profile' && (
                <motion.div
                  layoutId="activeBackground"
                  className="absolute inset-y-0 left-0 w-1/2 bg-purple-nave rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {activeTab === 'security' && (
                <motion.div
                  layoutId="activeBackground"
                  className="absolute inset-y-0 right-0 w-1/2 bg-purple-nave rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <button
                onClick={() => setActiveTab('profile')}
                className={`relative z-10 py-3 text-sm font-semibold transition-colors rounded-full ${
                  activeTab === 'profile'
                    ? 'text-white'
                    : 'text-black-nave hover:text-purple-nave dark:text-white-smoke'
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`relative z-10 py-3 text-sm font-semibold transition-colors rounded-full ${
                  activeTab === 'security'
                    ? 'text-white'
                    : 'text-black-nave hover:text-purple-nave dark:text-white-smoke'
                }`}
              >
                Security Settings
              </button>
            </div>
          </div>
          
          {/* Animated Form Content */}
          <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
          <motion.form 
            key="profile-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full" 
            onSubmit={handleSubmit}>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold" htmlFor="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold" htmlFor="lastName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold" htmlFor="bio">Bio</label>
                  <span className="text-sm text-gray-500">{bioLength}/300</span>
                </div>
                <textarea 
                  id="bio" 
                  name="bio" 
                  value={bio}
                  maxLength={300}
                  onChange={handleBioChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                  rows={4}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold" htmlFor="github">GitHub URL</label>
                  <input 
                    type="url" 
                    id="github" 
                    name="github" 
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold" htmlFor="instagram">Instagram URL</label>
                  <input 
                    type="url" 
                    id="instagram" 
                    name="instagram" 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button 
                  type="submit" 
                  disabled={!isFormValid}
                  className="py-2 px-6 inline-flex items-center 
                  gap-x-2 text-sm font-medium rounded-lg border border-transparent 
                  bg-purple-nave text-white hover:bg-blue-700 focus:outline-hidden 
                  focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.form>
          )}
        
        {activeTab === 'security' && (
        <motion.form
            key="security-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full" 
            onSubmit={handlePasswordSubmit}>
            <div className="w-full flex flex-col gap-4">
              {canChangePassword && (
                <div className="flex flex-col gap-2">
                  <label className="font-semibold" htmlFor="currentPassword">Current Password</label>
                  <input 
                    type="password" 
                    id="currentPassword" 
                    name="currentPassword" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                    placeholder="Enter your current password"
                  />
                </div>
              )}
              {!canChangePassword && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  Google sign-in only: password login is disabled and your password remains unset.
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold" htmlFor="newPassword">New Password</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    name="newPassword" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!canChangePassword}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold" htmlFor="confirmPassword">Confirm New Password</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!canChangePassword}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-nave"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
              
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-sm">Passwords do not match</p>
              )}
              
              {newPassword && newPassword.length < 8 && (
                <p className="text-red-500 text-sm">Password must be at least 8 characters</p>
              )}
              
              <div className="flex justify-end mt-6">
                <button 
                  type="submit" 
                  disabled={!isPasswordFormValid}
                  className="py-2 px-6 inline-flex items-center 
                  gap-x-2 text-sm font-medium rounded-lg border border-transparent 
                  bg-purple-nave text-white hover:bg-blue-700 focus:outline-hidden 
                  focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                  Change Password
                </button>
              </div>
            </div>
          </motion.form>
          )}
          
          {activeTab === 'security' && (
            <motion.div
              key="2fa-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full mt-6 p-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication (2FA)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account by enabling email verification for login attempts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggle2FA}
                  disabled={isTwoFactorBlocked}
                  className={`ml-4 py-2 px-6 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    twoFactorEnabled && !isTwoFactorBlocked
                      ? 'bg-red-500 text-white border-transparent hover:bg-red-600'
                      : 'bg-purple-nave text-white border-transparent hover:bg-blue-purple'
                  }`}
                >
                  {isTwoFactorBlocked ? 'Unavailable for Google sign-in' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
              {isTwoFactorBlocked && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  Two-Factor Authentication is disabled for Google-only accounts. Sign in with Google to stay secure.
                </div>
              )}
              {!isTwoFactorBlocked && twoFactorEnabled && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✓ Two-Factor Authentication is currently enabled for your account
                  </p>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    );
  }