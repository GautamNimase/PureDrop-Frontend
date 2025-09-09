import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BeakerIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api from '../config/api';

const Login = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, isUser } = useAuth();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    // Focus first invalid field
    setTimeout(() => {
      if (newErrors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (newErrors.password && passwordRef.current) {
        passwordRef.current.focus();
      }
    }, 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const endpoint = isAdminLogin ? '/api/auth/admin/login' : '/api/auth/user/login';
      const data = await api.post(endpoint, {
        email: formData.email,
        password: formData.password
      });
      // Save JWT and user/admin info
      login(isAdminLogin ? data.admin : data.user, data.token);
      navigate(isAdminLogin ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: err.message || 'Server error. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <BeakerIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Water Management
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign in to your account
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {/* Toggle between Admin and User login */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsAdminLogin(false)}
              aria-label="Switch to user login"
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isAdminLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdminLogin(true)}
              aria-label="Switch to admin login"
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isAdminLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin Login
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} aria-label="Login form">
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                ref={emailRef}
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder={isAdminLogin ? 'admin@email.com' : 'user@email.com'}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  ref={passwordRef}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isAdminLogin ? 'admin123' : 'user123'}
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="mt-2 text-sm text-red-600" aria-live="polite">{errors.password}</p>
              )}
              <div className="mt-2 text-right">
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

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            
          </form>
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Don’t have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="ml-2 text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition"
            >
              Sign up
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Demo Credentials:</h4>
              <div className="space-y-2 text-xs text-blue-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Admin:</span>
                  <span className="font-mono">admin@email.com / admin123</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">User:</span>
                  <span className="font-mono">user@email.com / user123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Municipal Cooperation Water Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 