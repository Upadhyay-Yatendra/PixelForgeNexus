import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  EyeOff, 
  ShieldCheckIcon,
  UserIcon,
  KeyIcon 
} from 'lucide-react';

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({});
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [mfaSetup, setMfaSetup] = useState(null);
  const [mfaToken, setMfaToken] = useState('');

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data) => authAPI.changePassword(data),
    {
      onSuccess: () => {
        setPasswords({ current: '', new: '', confirm: '' });
        toast.success('Password changed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to change password');
      }
    }
  );

  // Setup MFA mutation
  const setupMFAMutation = useMutation(
    () => authAPI.setupMFA(),
    {
      onSuccess: (response) => {
        setMfaSetup(response.data);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to setup MFA');
      }
    }
  );

  // Confirm MFA mutation
  const confirmMFAMutation = useMutation(
    (data) => authAPI.confirmMFA(data),
    {
      onSuccess: () => {
        updateUser({ mfaEnabled: true });
        setMfaSetup(null);
        setMfaToken('');
        toast.success('MFA enabled successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to confirm MFA');
      }
    }
  );

  // Disable MFA mutation
  const disableMFAMutation = useMutation(
    () => authAPI.disableMFA(),
    {
      onSuccess: () => {
        updateUser({ mfaEnabled: false });
        toast.success('MFA disabled successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to disable MFA');
      }
    }
  );

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.new
    });
  };

  const handleMFASetup = () => {
    setupMFAMutation.mutate();
  };

  const handleMFAConfirm = (e) => {
    e.preventDefault();
    confirmMFAMutation.mutate({
      secret: mfaSetup.secret,
      token: mfaToken
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'mfa', name: 'Two-Factor Auth', icon: ShieldCheckIcon }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={user.role}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 capitalize"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Login</label>
              <input
                type="text"
                value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPassword.current ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPassword.new ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPassword.confirm ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={changePasswordMutation.isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* MFA Tab */}
      {activeTab === 'mfa' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Two-Factor Authentication</h2>
          
          {user.mfaEnabled ? (
            <div className="text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Two-Factor Authentication is Enabled
              </h3>
              <p className="text-gray-600 mb-6">
                Your account is protected with two-factor authentication.
              </p>
              <button
                onClick={() => disableMFAMutation.mutate()}
                disabled={disableMFAMutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {disableMFAMutation.isLoading ? 'Disabling...' : 'Disable MFA'}
              </button>
            </div>
          ) : mfaSetup ? (
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Scan QR Code with Authenticator App
              </h3>
              <div className="mb-6">
                <img 
                  src={`data:image/png;base64,${mfaSetup.qrCode}`}
                  alt="MFA QR Code"
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Or enter this secret manually: <code className="bg-gray-100 px-2 py-1 rounded">{mfaSetup.secret}</code>
              </p>
              
              <form onSubmit={handleMFAConfirm} className="max-w-xs mx-auto">
                <input
                  type="text"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg tracking-widest mb-4"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
                <button
                  type="submit"
                  disabled={confirmMFAMutation.isLoading || mfaToken.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {confirmMFAMutation.isLoading ? 'Enabling...' : 'Enable MFA'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Two-Factor Authentication is Disabled
              </h3>
              <p className="text-gray-600 mb-6">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <button
                onClick={handleMFASetup}
                disabled={setupMFAMutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {setupMFAMutation.isLoading ? 'Setting up...' : 'Enable MFA'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
