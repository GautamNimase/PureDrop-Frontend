import React, { useEffect, useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import InlineEditField from '../common/InlineEditField';
import Tooltip from '../common/Tooltip';
import StatsCard from '../common/StatsCard';
import NotificationBadge from '../common/NotificationBadge';
import GlowButton from '../common/GlowButton';
import ProgressBar from '../common/ProgressBar';
import useResponsiveBreakpoints from '../../hooks/useResponsiveBreakpoints';
import useOptimizedAnimations from '../../hooks/useOptimizedAnimations';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PencilIcon,
  KeyIcon,
  CheckCircleIcon,
  XMarkIcon,
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CreditCardIcon,
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const UserProfile = memo(() => {
  const { user, login, token } = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoints();
  const animations = useOptimizedAnimations(isMobile);
  
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [personalForm, setPersonalForm] = useState({
    firstName: (user?.Name || user?.name || '').split(' ').slice(0, 1).join(' ') || '',
    lastName: (user?.Name || user?.name || '').split(' ').slice(1).join(' ') || '',
    email: user?.Email || user?.email || '',
    phone: user?.Phone || user?.phone || '',
    dob: user?.DOB || user?.dob || '',
  });
  
  const [addressForm, setAddressForm] = useState({
    line1: user?.Address?.Line1 || '',
    line2: user?.Address?.Line2 || '',
    city: user?.Address?.City || '',
    state: user?.Address?.State || '',
    postalCode: user?.Address?.PostalCode || '',
    country: user?.Address?.Country || '',
  });
  
  const [passwordData, setPasswordData] = useState({ 
    oldPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  
  // Error states
  const [personalErrors, setPersonalErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [rippleKey, setRippleKey] = useState(0);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [showTooltip, setShowTooltip] = useState(null);

  // Use optimized animation variants
  const containerVariants = animations.container;
  const cardVariants = animations.card;
  const buttonVariants = animations.button;

  const avatarVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rippleVariants = {
    initial: { scale: 0, opacity: 0.6 },
    animate: { 
      scale: 1, 
      opacity: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const expandVariants = {
    collapsed: { 
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: { 
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${profileCompleteness}%`,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  const glowVariants = {
    hover: {
      boxShadow: [
        "0 0 0 0 rgba(59, 130, 246, 0.4)",
        "0 0 0 8px rgba(59, 130, 246, 0)",
        "0 0 0 0 rgba(59, 130, 246, 0)"
      ],
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const tooltipVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };


  // Validation helpers
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{7,15}$/.test(phone);
  const validatePassword = (pw) => pw.length >= 6;

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    let completed = 0;
    let total = 0;
    
    // Personal info fields
    const personalFields = ['Name', 'Email', 'Phone', 'DOB'];
    personalFields.forEach(field => {
      total++;
      if (user?.[field] || user?.[field.toLowerCase()]) completed++;
    });
    
    // Address fields
    const addressFields = ['Line1', 'City', 'State', 'Country'];
    addressFields.forEach(field => {
      total++;
      if (user?.Address?.[field]) completed++;
    });
    
    return Math.round((completed / total) * 100);
  };

  // Update profile completeness when user data changes
  useEffect(() => {
    setProfileCompleteness(calculateProfileCompleteness());
  }, [user]);

  // Simulate dynamic notification updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationCount(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Optimized inline editing handlers
  const handleInlineEdit = useCallback((field, currentValue) => {
    setEditingField(field);
    setEditingValue(currentValue || '');
  }, []);

  const handleInlineSave = useCallback((value) => {
    if (editingField && value !== '') {
      // Update user data
      const updatedUser = { ...user };
      if (editingField === 'name') {
        updatedUser.Name = value;
      } else if (editingField === 'email') {
        updatedUser.Email = value;
      } else if (editingField === 'phone') {
        updatedUser.Phone = value;
      }
      
      login(updatedUser, localStorage.getItem('token'));
      setSuccessMsg('Field updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
    }
    setEditingField(null);
    setEditingValue('');
  }, [editingField, user, login]);

  const handleInlineCancel = useCallback(() => {
    setEditingField(null);
    setEditingValue('');
  }, []);

  // Memoized activity stats data
  const activityStats = useMemo(() => [
    {
      icon: ChartBarIcon,
      title: 'Connections',
      value: user?.connections || '2',
      color: 'blue'
    },
    {
      icon: CreditCardIcon,
      title: 'Bills Paid',
      value: user?.billsPaid || '12',
      color: 'green'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Support Tickets',
      value: user?.supportTickets || '3',
      color: 'orange'
    }
  ], [user]);

  // Profile Header Card Component
  const ProfileHeaderCard = memo(() => (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
              variants={avatarVariants}
              animate="pulse"
            >
              <UserCircleIcon className="w-10 h-10 text-white relative z-10" />
              {/* Pulsing border effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-white/30"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <motion.div 
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  "0 0 0 6px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Dynamic Notification Badge */}
            <NotificationBadge count={notificationCount} />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            {/* Inline Editable Name */}
            <InlineEditField
              value={user?.Name || user?.name}
              onSave={handleInlineSave}
              onCancel={handleInlineCancel}
              fieldType="text"
              className="text-2xl mb-2 tracking-tight"
              iconColor="blue"
              tooltip="Click to edit your name"
              isEditing={editingField === 'name'}
              onEdit={() => handleInlineEdit('name', user?.Name || user?.name)}
            />

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
              <Tooltip content={`You're on the ${user?.plan || 'Free'} plan. Click to upgrade!`}>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-inter cursor-pointer hover:from-blue-200 hover:to-purple-200 transition-all duration-300">
                  <StarIcon className="w-4 h-4 mr-1" />
                  {user?.plan || 'Free'} Plan
                </span>
              </Tooltip>
              <span className="text-sm text-gray-500 font-inter flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            
            {/* Profile Completeness Progress */}
            <div className="mb-3">
              <ProgressBar 
                percentage={profileCompleteness}
                color="blue"
                size="md"
                label="Profile Completeness"
                showLabel={true}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ));

  // Activity Stats Card Component
  const ActivityStatsCard = memo(() => (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-900 font-poppins mb-4 tracking-tight">Activity Overview</h3>
        
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {activityStats.map((stat, index) => (
            <StatsCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>
      </div>
    </motion.div>
  ));

  // Handlers
  const handlePersonalEdit = () => {
    const fullName = user?.Name || user?.name || '';
    setPersonalForm({
      firstName: fullName.split(' ').slice(0, 1).join(' ') || '',
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      email: user?.Email || user?.email || '',
      phone: user?.Phone || user?.phone || '',
      dob: user?.DOB || user?.dob || '',
    });
    setShowPersonalModal(true);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalSave = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!personalForm.firstName) errors.firstName = 'First name is required.';
    if (!personalForm.email) errors.email = 'Email is required.';
    else if (!validateEmail(personalForm.email)) errors.email = 'Invalid email format.';
    if (personalForm.phone && !validatePhone(personalForm.phone)) errors.phone = 'Invalid phone number.';
    
    setPersonalErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user?.UserID || user?.id || user?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Name: `${personalForm.firstName}${personalForm.lastName ? ' ' + personalForm.lastName : ''}`.trim(), 
          Email: personalForm.email, 
          Phone: personalForm.phone 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update user');
      
      const updated = { ...user, ...data.user };
      login(updated, localStorage.getItem('token'));
      setShowPersonalModal(false);
      setSuccessMsg('Personal information updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating personal info:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddressEdit = () => {
    setAddressForm({
      line1: user?.Address?.Line1 || '',
      line2: user?.Address?.Line2 || '',
      city: user?.Address?.City || '',
      state: user?.Address?.State || '',
      postalCode: user?.Address?.PostalCode || '',
      country: user?.Address?.Country || '',
    });
    setShowAddressModal(true);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addressForm.line1) errors.line1 = 'Address line is required.';
    if (!addressForm.city) errors.city = 'City is required.';
    
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user?.UserID || user?.id || user?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Address: { 
            Line1: addressForm.line1, 
            Line2: addressForm.line2, 
            City: addressForm.city, 
            State: addressForm.state, 
            PostalCode: addressForm.postalCode, 
            Country: addressForm.country 
          } 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update address');
      
      const updated = { ...user, ...data.user };
      login(updated, localStorage.getItem('token'));
      setShowAddressModal(false);
      setSuccessMsg('Address updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

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
      setSuccessMsg('Password changed successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSaving(false);
    }, 1000);
  };

  // Profile Card Component
  const ProfileCard = () => (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <motion.div 
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
            variants={avatarVariants}
            animate="pulse"
          >
            <UserCircleIcon className="w-12 h-12 text-white relative z-10" />
            {/* Pulsing border effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-white/30"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          <motion.div 
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm"
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 0 0 rgba(34, 197, 94, 0.4)",
                "0 0 0 8px rgba(34, 197, 94, 0)",
                "0 0 0 0 rgba(34, 197, 94, 0)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-gray-900 font-poppins mb-3 tracking-tight">
            {user?.Name || user?.name || 'User Name'}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 font-inter">
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              {user?.role || 'User'}
            </span>
            <span className="text-sm text-gray-500 font-inter font-medium">
              {user?.Address?.City || 'City'}, {user?.Address?.Country || 'Country'}
            </span>
          </div>
          <p className="text-gray-600 font-inter font-medium">{user?.Email || user?.email || 'No email set'}</p>
        </div>
      </div>
    </motion.div>
  );

  // Personal Information Card
  const PersonalInfoCard = memo(() => (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">Personal Information</h3>
          <GlowButton
            onClick={handlePersonalEdit}
            color="blue"
            size="md"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Edit</span>
          </GlowButton>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">Full Name</p>
              <InlineEditField
                value={user?.Name || user?.name}
                onSave={handleInlineSave}
                onCancel={handleInlineCancel}
                fieldType="text"
                className="text-lg"
                iconColor="blue"
                tooltip="Click to edit your full name"
                isEditing={editingField === 'name'}
                onEdit={() => handleInlineEdit('name', user?.Name || user?.name)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <EnvelopeIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">Email Address</p>
              <InlineEditField
                value={user?.Email || user?.email}
                onSave={handleInlineSave}
                onCancel={handleInlineCancel}
                fieldType="email"
                className="text-lg"
                iconColor="green"
                tooltip="Click to edit your email address"
                isEditing={editingField === 'email'}
                onEdit={() => handleInlineEdit('email', user?.Email || user?.email)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">Phone Number</p>
              <InlineEditField
                value={user?.Phone || user?.phone}
                onSave={handleInlineSave}
                onCancel={handleInlineCancel}
                fieldType="tel"
                className="text-lg"
                iconColor="orange"
                tooltip="Click to edit your phone number"
                isEditing={editingField === 'phone'}
                onEdit={() => handleInlineEdit('phone', user?.Phone || user?.phone)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">Date of Birth</p>
              <p className="font-bold text-gray-900 font-poppins text-lg">{user?.DOB || user?.dob || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">User Role</p>
              <p className="font-bold text-gray-900 font-poppins text-lg">{user?.role || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">Account Status</p>
              <p className="font-bold text-gray-900 font-poppins text-lg">{user?.status || 'Active'}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  ));

  // Address Card (Collapsible)
  const AddressCard = memo(() => (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">Address Information</h3>
          <div className="flex items-center gap-3">
            <GlowButton
              onClick={handleAddressEdit}
              color="green"
              size="md"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </GlowButton>
            <motion.button
              onClick={() => setIsAddressExpanded(!isAddressExpanded)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isAddressExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </motion.button>
          </div>
            </div>

        {/* Address Summary (Always Visible) */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPinIcon className="w-5 h-5 text-blue-500" />
            </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-inter font-medium mb-1">Primary Address</p>
            <p className="font-bold text-gray-900 font-poppins text-lg">
              {user?.Address?.Line1 || '-'}
              {user?.Address?.Line2 && `, ${user?.Address?.Line2}`}
            </p>
            <p className="text-sm text-gray-600 font-inter">
              {user?.Address?.City || '-'}, {user?.Address?.State || '-'} {user?.Address?.PostalCode || ''}
            </p>
          </div>
        </div>

        {/* Collapsible Detailed Address */}
        <AnimatePresence>
          {isAddressExpanded && (
            <motion.div
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 text-green-500" />
          </div>
            <div>
                    <p className="text-xs text-gray-500 font-inter font-medium mb-1">City</p>
                    <p className="font-bold text-gray-900 font-poppins">{user?.Address?.City || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 text-orange-500" />
            </div>
            <div>
                    <p className="text-xs text-gray-500 font-inter font-medium mb-1">State</p>
                    <p className="font-bold text-gray-900 font-poppins">{user?.Address?.State || '-'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 text-purple-500" />
            </div>
            <div>
                    <p className="text-xs text-gray-500 font-inter font-medium mb-1">Postal Code</p>
                    <p className="font-bold text-gray-900 font-poppins">{user?.Address?.PostalCode || '-'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-gray-500" />
            </div>
            <div>
                  <p className="text-xs text-gray-500 font-inter font-medium mb-1">Country</p>
                  <p className="font-bold text-gray-900 font-poppins">{user?.Address?.Country || '-'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  ));

  // Security Card
  const SecurityCard = memo(() => (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 relative overflow-hidden"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">Security Settings</h3>
          <GlowButton
            onClick={() => setShowPasswordModal(true)}
            color="orange"
            size="md"
          >
            <KeyIcon className="w-4 h-4" />
            <span>Change Password</span>
          </GlowButton>
        </div>
      
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">Password Status</p>
              <p className="font-bold text-gray-900 font-poppins text-lg">Last changed: Never</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-inter font-medium mb-1">Two-Factor Authentication</p>
              <p className="font-bold text-gray-900 font-poppins text-lg">Not enabled</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ));

  // Modal Component without animations
  const Modal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 pointer-events-none"></div>
            
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-poppins">
                  {title}
                </h3>
              <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
              </div>
              <div>
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
      {/* Page Header with New Color Scheme */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-2xl shadow-xl p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white font-poppins mb-3 tracking-tight">
              User Profile
            </h1>
            <p className="text-lg text-white/90 font-inter font-medium">
              Manage your personal information and account settings
            </p>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-sm font-inter">Dashboard</span>
            <span className="text-white/60">›</span>
            <span className="text-sm font-inter font-medium">Profile</span>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header Card */}
      <ProfileHeaderCard />

      {/* Activity Stats Card */}
      <ActivityStatsCard />

        {/* Profile Cards Grid */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {/* Personal Information */}
          <PersonalInfoCard />
          
          {/* Address Information (Collapsible) */}
          <AddressCard />
          
          {/* Security Settings */}
          <div className={isMobile || isTablet ? 'col-span-1' : 'col-span-2'}>
            <SecurityCard />
          </div>
        </div>


      {/* Personal Information Modal */}
      <Modal
        isOpen={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        title="Edit Personal Information"
      >
              <form onSubmit={handlePersonalSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={personalForm.firstName}
                      onChange={handlePersonalChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  personalErrors.firstName ? 'border-red-400' : 'border-gray-300'
                }`}
                      required
                    />
              {personalErrors.firstName && (
                <p className="text-sm text-red-500 mt-1">{personalErrors.firstName}</p>
              )}
                  </div>
            
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={personalForm.lastName}
                      onChange={handlePersonalChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
            
                  <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={personalForm.email}
                      onChange={handlePersonalChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  personalErrors.email ? 'border-red-400' : 'border-gray-300'
                }`}
                      required
                    />
              {personalErrors.email && (
                <p className="text-sm text-red-500 mt-1">{personalErrors.email}</p>
              )}
                  </div>
            
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={personalForm.phone}
                      onChange={handlePersonalChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  personalErrors.phone ? 'border-red-400' : 'border-gray-300'
                }`}
                    />
              {personalErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{personalErrors.phone}</p>
              )}
                  </div>
            
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={personalForm.dob}
                      onChange={handlePersonalChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  </div>
          
          <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPersonalModal(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-inter font-semibold"
            >
              Cancel
            </button>
                  <button
                    type="submit"
                    disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-inter font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/25 flex items-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
      </Modal>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Edit Address"
      >
              <form onSubmit={handleAddressSave} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                    <input
                      type="text"
                      name="line1"
                      value={addressForm.line1}
                      onChange={handleAddressChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  addressErrors.line1 ? 'border-red-400' : 'border-gray-300'
                }`}
                      required
                    />
              {addressErrors.line1 && (
                <p className="text-sm text-red-500 mt-1">{addressErrors.line1}</p>
              )}
                  </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                name="line2"
                value={addressForm.line2}
                      onChange={handleAddressChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    />
                  </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                    addressErrors.city ? 'border-red-400' : 'border-gray-300'
                  }`}
                      required
                    />
                {addressErrors.city && (
                  <p className="text-sm text-red-500 mt-1">{addressErrors.city}</p>
                )}
                  </div>
              
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    />
                  </div>
              
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    />
                  </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                />
                </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-inter font-semibold"
            >
              Cancel
            </button>
                  <button
                    type="submit"
                    disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 font-inter font-semibold shadow-lg hover:shadow-xl hover:shadow-green-500/25 flex items-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
      >
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
                    <input
                      type="password"
                name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                  passwordErrors.oldPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                      required
                    />
              {passwordErrors.oldPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordErrors.oldPassword}</p>
              )}
                  </div>
            
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                  passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                      required
                    />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>
              )}
                  </div>
            
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                  passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                      required
                    />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
              )}
                  </div>
                </div>
          
          <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-inter font-semibold"
            >
              Cancel
            </button>
                  <button
                    type="submit"
                    disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-inter font-semibold shadow-lg hover:shadow-xl hover:shadow-orange-500/25 flex items-center gap-2"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
      </Modal>
      </motion.div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile; 