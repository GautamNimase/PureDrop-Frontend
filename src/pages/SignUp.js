import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
// Direct API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://puredrop-backend.onrender.com/api';

const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('/api') 
    ? `${API_BASE_URL}${endpoint.substring(4)}`
    : `${API_BASE_URL}${endpoint}`;
  
  console.log('API Call:', { endpoint, url, options });
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', { status: response.status, statusText: response.statusText, errorText });
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

const SignUp = () => {
  const [isAdminSignup, setIsAdminSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '' // Only for user
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { addUser, getUserByEmail } = useData();
  const { login, isAuthenticated, isAdmin, isUser } = useAuth();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin && isAdmin()) {
        navigate('/admin/dashboard', { replace: true });
      } else if (isUser && isUser()) {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isUser, navigate]);

  useEffect(() => {
    if (errors.general && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors.general]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!isAdminSignup && !formData.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    // Focus first invalid field
    setTimeout(() => {
      if (newErrors.name && nameRef.current) nameRef.current.focus();
      else if (newErrors.email && emailRef.current) emailRef.current.focus();
      else if (newErrors.password && passwordRef.current) passwordRef.current.focus();
      else if (newErrors.confirmPassword && confirmPasswordRef.current) confirmPasswordRef.current.focus();
      else if (newErrors.phone && phoneRef.current) phoneRef.current.focus();
      else if (newErrors.address && addressRef.current) addressRef.current.focus();
    }, 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const endpoint = isAdminSignup ? '/api/auth/admin/signup' : '/api/auth/user/signup';
      const payload = isAdminSignup
        ? { name: formData.name, email: formData.email, password: formData.password, phone: formData.phone }
        : { name: formData.name, email: formData.email, password: formData.password, phone: formData.phone, address: formData.address };
      
      const data = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      setErrors({ general: err.message || 'Server error. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-white text-2xl font-bold">WS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 text-sm sm:text-base">Sign up to get started</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsAdminSignup(false)}
              aria-label="Switch to user signup"
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isAdminSignup
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Signup
            </button>
            <button
              type="button"
              onClick={() => setIsAdminSignup(true)}
              aria-label="Switch to admin signup"
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isAdminSignup
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin Signup
            </button>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit} aria-label="Sign up form">
            {errors.general && (
              <div
                ref={errorRef}
                tabIndex={-1}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-fadeIn"
                aria-live="polite"
                aria-atomic="true"
              >
                {errors.general}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fadeIn" aria-live="polite">
                Account created! Please log in.
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                ref={nameRef}
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="Your name"
                autoComplete="name"
              />
              {errors.name && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                ref={emailRef}
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="you@email.com"
                autoComplete="email"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  ref={passwordRef}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  ref={confirmPasswordRef}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
                >
                  {showConfirm ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.confirmPassword}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                id="phone"
                name="phone"
                type="text"
                required
                ref={phoneRef}
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="Your phone number"
                autoComplete="tel"
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.phone}</p>}
            </div>
            {!isAdminSignup && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  ref={addressRef}
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                  placeholder="Your address"
                  autoComplete="street-address"
                />
                {errors.address && <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.address}</p>}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || success}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Already have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="ml-2 text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
            >
              Sign in
            </button>
            <div className="mt-2">
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                onClick={() => alert('Forgot password functionality coming soon!')}
                tabIndex={0}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 