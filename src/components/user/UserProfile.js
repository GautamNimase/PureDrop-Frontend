import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    role: user?.role || '',
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    country: user?.country || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Validation state
  const [personalErrors, setPersonalErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Loading state for modals
  const [saving, setSaving] = useState(false);

  // Validation helpers
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{7,15}$/.test(phone);
  const validatePassword = (pw) => pw.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData };
    login(updatedUser);
    setEditing(false);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatar: user?.avatar || '',
    });
    setAvatarPreview(user?.avatar || '');
    setEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Personal Info Modal Save
  const handlePersonalSave = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!personalForm.firstName) errors.firstName = 'First name is required.';
    if (!personalForm.lastName) errors.lastName = 'Last name is required.';
    if (!personalForm.email) errors.email = 'Email is required.';
    else if (!validateEmail(personalForm.email)) errors.email = 'Invalid email format.';
    if (personalForm.phone && !validatePhone(personalForm.phone)) errors.phone = 'Invalid phone number.';
    setPersonalErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setTimeout(() => {
      login({ ...user, ...personalForm });
      setShowPersonalModal(false);
      setSaving(false);
    }, 1000);
  };

  // Address Modal Save
  const handleAddressSave = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addressForm.country) errors.country = 'Country is required.';
    if (!addressForm.city) errors.city = 'City is required.';
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setTimeout(() => {
      login({ ...user, ...addressForm });
      setShowAddressModal(false);
      setSaving(false);
    }, 1000);
  };

  // Password Modal Save
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.oldPassword) errors.oldPassword = 'Old password is required.';
    if (!passwordData.newPassword) errors.newPassword = 'New password is required.';
    else if (!validatePassword(passwordData.newPassword)) errors.newPassword = 'Password must be at least 6 characters.';
    if (!passwordData.confirmPassword) errors.confirmPassword = 'Please confirm new password.';
    else if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setTimeout(() => {
      setPasswordMsg('Password changed successfully!');
      setTimeout(() => setPasswordMsg(''), 3000);
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSaving(false);
    }, 1000);
  };

  const handlePersonalEdit = () => {
    setPersonalForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dob: user?.dob || '',
      role: user?.role || '',
    });
    setShowPersonalModal(true);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressEdit = () => {
    setAddressForm({
      country: user?.country || '',
      city: user?.city || '',
      postalCode: user?.postalCode || '',
    });
    setShowAddressModal(true);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenPasswordModal = () => setShowPasswordModal(true);
  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto rounded-2xl shadow-lg bg-white overflow-hidden p-8">
        {/* Profile Card Top Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-200">
          <div className="relative w-28 h-28 rounded-full border-4 border-white shadow bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500 overflow-hidden group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              user?.name ? user.name[0] : '?' 
            )}
            {/* Avatar Upload Overlay */}
            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full cursor-pointer transition duration-200">
              <span className="opacity-0 group-hover:opacity-100 text-white text-2xl transition duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6.75A2.25 2.25 0 0013.5 4.5h-3A2.25 2.25 0 008.25 6.75v3.75m11.25 0a2.25 2.25 0 012.25 2.25v6.75A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V12a2.25 2.25 0 012.25-2.25m16.5 0H4.5" />
                </svg>
              </span>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
            <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'Name not set'}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">{user?.role || 'User'}</span>
              <span className="text-sm text-gray-400">{user?.city || 'City'}, {user?.country || 'Country'}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{user?.email || 'No email set'}</p>
            {/* Account Status and Last Login */}
            <div className="flex items-center gap-3 mt-2">
              {/* Status Badge */}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user?.status === 'Active' ? 'bg-green-100 text-green-700' : user?.status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-500'}`}>{user?.status || 'Unknown'}</span>
              {/* Last Login */}
              <span className="text-xs text-gray-400">Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>
        {/* Personal Information Card */}
        <div className="mt-8 bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            <button onClick={handlePersonalEdit} className="text-white bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded flex items-center gap-1 text-sm font-medium active:scale-95 transition-transform">
              Edit
              <span className="material-icons text-base">edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-400">First Name</div>
              <div className="font-medium text-gray-700">{user?.firstName || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Last Name</div>
              <div className="font-medium text-gray-700">{user?.lastName || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Date of Birth</div>
              <div className="font-medium text-gray-700">{user?.dob || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Email Address</div>
              <div className="font-medium text-gray-700">{user?.email || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Phone Number</div>
              <div className="font-medium text-gray-700">{user?.phone || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">User Role</div>
              <div className="font-medium text-gray-700">{user?.role || '-'}</div>
            </div>
          </div>
        </div>
        {/* Personal Information Edit Modal */}
        {showPersonalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl active:scale-90 transition-transform"
                onClick={() => setShowPersonalModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Edit Personal Information</h3>
              <form onSubmit={handlePersonalSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={personalForm.firstName}
                      onChange={handlePersonalChange}
                      className={`w-full border ${personalErrors.firstName ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {personalErrors.firstName && <div className="text-xs text-red-500 mt-1">{personalErrors.firstName}</div>}
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={personalForm.lastName}
                      onChange={handlePersonalChange}
                      className={`w-full border ${personalErrors.lastName ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {personalErrors.lastName && <div className="text-xs text-red-500 mt-1">{personalErrors.lastName}</div>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 text-sm mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={personalForm.email}
                      onChange={handlePersonalChange}
                      className={`w-full border ${personalErrors.email ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {personalErrors.email && <div className="text-xs text-red-500 mt-1">{personalErrors.email}</div>}
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={personalForm.phone}
                      onChange={handlePersonalChange}
                      className={`w-full border ${personalErrors.phone ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                    />
                    {personalErrors.phone && <div className="text-xs text-red-500 mt-1">{personalErrors.phone}</div>}
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={personalForm.dob}
                      onChange={handlePersonalChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 text-sm mb-1">User Role</label>
                    <input
                      type="text"
                      name="role"
                      value={personalForm.role}
                      disabled
                      className="w-full border border-gray-200 rounded px-3 py-2 bg-gray-100 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 active:scale-95 transition-transform"
                    onClick={() => setShowPersonalModal(false)}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 active:scale-95 font-medium shadow transition-transform flex items-center justify-center min-w-[110px]"
                    disabled={saving}
                  >
                    {saving ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : null}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Address Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Address</h3>
            <button onClick={handleAddressEdit} className="text-white bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded flex items-center gap-1 text-sm font-medium active:scale-95 transition-transform">
              Edit
              <span className="material-icons text-base">edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-400">Country</div>
              <div className="font-medium text-gray-700">{user?.country || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">City</div>
              <div className="font-medium text-gray-700">{user?.city || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Postal Code</div>
              <div className="font-medium text-gray-700">{user?.postalCode || '-'}</div>
            </div>
          </div>
        </div>
        {/* Address Edit Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl active:scale-90 transition-transform"
                onClick={() => setShowAddressModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Edit Address</h3>
              <form onSubmit={handleAddressSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 text-sm mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressChange}
                      className={`w-full border ${addressErrors.country ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {addressErrors.country && <div className="text-xs text-red-500 mt-1">{addressErrors.country}</div>}
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      className={`w-full border ${addressErrors.city ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {addressErrors.city && <div className="text-xs text-red-500 mt-1">{addressErrors.city}</div>}
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 active:scale-95 transition-transform"
                    onClick={() => setShowAddressModal(false)}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 active:scale-95 font-medium shadow transition-transform flex items-center justify-center min-w-[110px]"
                    disabled={saving}
                  >
                    {saving ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : null}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
      </div>
        )}
        {/* Change Password Button */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full justify-center">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 active:scale-95 transition-transform shadow-md"
            onClick={handleOpenPasswordModal}
          >Change Password</button>
        </div>
        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl active:scale-90 transition-transform"
                onClick={handleClosePasswordModal}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 text-sm mb-1">Old Password</label>
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className={`w-full border ${passwordErrors.oldPassword ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {passwordErrors.oldPassword && <div className="text-xs text-red-500 mt-1">{passwordErrors.oldPassword}</div>}
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full border ${passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {passwordErrors.newPassword && <div className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</div>}
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full border ${passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      required
                    />
                    {passwordErrors.confirmPassword && <div className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</div>}
                  </div>
                </div>
                {passwordMsg && <div className={`text-sm mt-2 text-center ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</div>}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 active:scale-95 transition-transform"
                    onClick={handleClosePasswordModal}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 active:scale-95 font-medium shadow transition-transform flex items-center justify-center min-w-[110px]"
                    disabled={saving}
                  >
                    {saving ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : null}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 