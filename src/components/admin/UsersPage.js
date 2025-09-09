import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import AdminLayout from './AdminLayout';

const initialFormState = {
  Name: '',
  Address: '',
  Phone: '',
  Email: '',
  ConnectionType: '',
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modern features state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showUserDetails, setShowUserDetails] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Memoized filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.Phone?.includes(searchTerm);
      const matchesFilter = filterType === 'all' || user.ConnectionType === filterType;
      return matchesSearch && matchesFilter;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.Name?.toLowerCase() || '';
          bValue = b.Name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.Email?.toLowerCase() || '';
          bValue = b.Email?.toLowerCase() || '';
          break;
        case 'connection':
          aValue = a.ConnectionType?.toLowerCase() || '';
          bValue = b.ConnectionType?.toLowerCase() || '';
          break;
        default:
          aValue = a.Name?.toLowerCase() || '';
          bValue = b.Name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [users, searchTerm, filterType, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, page, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const residential = users.filter(u => u.ConnectionType === 'Residential').length;
    const commercial = users.filter(u => u.ConnectionType === 'Commercial').length;
    return { total, residential, commercial };
  }, [users]);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-open add modal if navigated with action=add
  useEffect(() => {
    if (
      location.state &&
      location.state.action === 'add' &&
      !showForm
    ) {
      openAddForm();
      // Clear the state so it doesn't reopen on every navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, showForm, navigate, location.pathname]);

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setFormData({
      Name: user.Name,
      Address: formatAddress(user.Address),
      Phone: user.Phone,
      Email: user.Email,
      ConnectionType: user.ConnectionType,
    });
    setIsEdit(true);
    setEditId(user.UserID);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.Name.trim()) errors.Name = 'Name is required';
    if (!formData.Address.trim()) errors.Address = 'Address is required';
    if (!formData.Phone.trim()) {
      errors.Phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.Phone)) {
      errors.Phone = 'Phone must be exactly 10 digits';
    }
    if (!formData.Email.trim()) {
      errors.Email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.Email)) {
      errors.Email = 'Invalid email format';
    }
    if (!formData.ConnectionType.trim()) errors.ConnectionType = 'Connection Type is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/users/${editId}` : '/api/users';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        // If backend returns validation errors, show them in the form
        if (errorData.details) {
          setFormErrors(errorData.details);
        } else {
          alert(errorData.error || 'Failed to save user');
        }
        setSubmitting(false);
        return;
      }
      const user = await res.json();
      if (isEdit) {
        setUsers((prev) => prev.map((u) => u.UserID === user.UserID ? user : u));
      } else {
        setUsers((prev) => [...prev, user]);
      }
      closeForm();
      setSuccessMsg(isEdit ? 'User updated successfully!' : 'User added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
      setSuccessMsg('User deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.UserID));
    }
  }, [selectedUsers.length, paginatedUsers]);

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return;
    try {
      await Promise.all(
        selectedUsers.map(userId => 
          fetch(`/api/users/${userId}`, { method: 'DELETE' })
        )
      );
      fetchUsers();
      setSelectedUsers([]);
      setSuccessMsg(`${selectedUsers.length} users deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to delete some users');
    }
  }, [selectedUsers]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  }, []);

  // Helper function to format address
  const formatAddress = useCallback((address) => {
    if (!address) return 'No address';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.Line1) parts.push(address.Line1);
      if (address.City) parts.push(address.City);
      if (address.State) parts.push(address.State);
      if (address.PostalCode) parts.push(address.PostalCode);
      if (address.Country) parts.push(address.Country);
      return parts.join(', ') || 'No address';
    }
    return 'No address';
  }, []);

  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (showForm && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeForm();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  // Focus trap for modal
  useEffect(() => {
    if (!showForm) return;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    const firstEl = modal.querySelectorAll(focusableElements)[0];
    const focusEls = modal.querySelectorAll(focusableElements);
    const lastEl = focusEls[focusEls.length - 1];
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    modal.addEventListener('keydown', trap);
    return () => modal.removeEventListener('keydown', trap);
  }, [showForm]);

  return (
    <AdminLayout currentPage="users" hideHeader={showUserDetails || showForm}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float animation-delay-200"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-float animation-delay-400"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-float animation-delay-300"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-blue-50/40"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite'
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(-20px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes gridMove {
              0% { transform: translate(0, 0); }
              100% { transform: translate(50px, 50px); }
            }
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
            .animate-slideIn { animation: slideIn 0.6s ease-out; }
            .animate-scaleIn { animation: scaleIn 0.6s ease-out; }
            .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
            .animate-float { animation: float 3s ease-in-out infinite; }
            .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
            .animate-gradient { 
              background-size: 200% 200%;
              animation: gradientShift 8s ease infinite;
            }
            .animation-delay-100 { animation-delay: 0.1s; }
            .animation-delay-200 { animation-delay: 0.2s; }
            .animation-delay-300 { animation-delay: 0.3s; }
            .animation-delay-400 { animation-delay: 0.4s; }
            .animation-delay-500 { animation-delay: 0.5s; }
            .glass-effect {
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.18);
            }
            .glass-card {
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.3);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
          `}</style>

      {/* Success Message */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-[10000] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Users Management
            </h1>
            <p className="text-gray-600 text-lg">Manage user information and accounts with advanced tools</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={fetchUsers}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowPathIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <UserGroupIcon className="h-8 w-8 text-white animate-float" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-shimmer"></div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Residential</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent animate-gradient">{stats.residential}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <HomeIcon className="h-8 w-8 text-white animate-float animation-delay-200" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-emerald-200 to-emerald-400 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-shimmer animation-delay-200"></div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-400 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Commercial</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent animate-gradient">{stats.commercial}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <CogIcon className="h-8 w-8 text-white animate-float animation-delay-400" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-purple-200 to-purple-400 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-shimmer animation-delay-400"></div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="glass-card rounded-2xl p-6 mb-6 animate-slideIn">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="all">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="email-asc">Email A-Z</option>
                <option value="email-desc">Email Z-A</option>
                <option value="connection-asc">Type A-Z</option>
                <option value="connection-desc">Type Z-A</option>
              </select>

              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                Reset
              </button>
            </div>
      </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
        <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
        >
                  Delete Selected
        </button>
              </div>
            </div>
        )}
      </div>
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fadeIn">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="text-lg font-medium text-gray-900 mt-4 animate-pulse-slow">Loading users...</p>
              <p className="text-sm text-gray-500 animate-fadeIn animation-delay-200">Please wait while we fetch the data</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</p>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedUsers.map((user, index) => (
                    <div
                      key={user.UserID || user._id}
                      className={`glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 border-2 ${
                        selectedUsers.includes(user.UserID) 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : 'border-transparent hover:border-white/50'
                      } animate-scaleIn group`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.UserID)}
                            onChange={() => handleSelectUser(user.UserID)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {user.Name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.ConnectionType === 'Residential' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {user.ConnectionType}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{user.Name}</h3>
                          <p className="text-gray-500 text-sm">User ID: {index + 1}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4" />
                            <span className="truncate">{user.Email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{user.Phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <HomeIcon className="h-4 w-4" />
                            <span className="truncate">{formatAddress(user.Address)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setShowUserDetails(user)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDelete(user.UserID)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Table View */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/10 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
              </tr>
            </thead>
                  <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/20">
                    {paginatedUsers.map((user, index) => (
                      <tr
                        key={user.UserID || user._id}
                        className={`hover:bg-white/10 transition-all duration-300 ${
                          selectedUsers.includes(user.UserID) ? 'bg-blue-50/30' : ''
                        } animate-fadeIn`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.UserID)}
                            onChange={() => handleSelectUser(user.UserID)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                              <span className="text-white font-bold">
                                {user.Name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.Name}</div>
                              <div className="text-sm text-gray-500">ID: {index + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{user.Email}</div>
                          <div className="text-sm text-gray-500">{user.Phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {formatAddress(user.Address)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.ConnectionType === 'Residential' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {user.ConnectionType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                    <button
                              onClick={() => setShowUserDetails(user)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                              <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.UserID)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                              <TrashIcon className="h-4 w-4" />
                    </button>
                          </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/20 bg-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          page === i + 1
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserDetails(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <span className="text-white font-bold text-2xl">
                    {showUserDetails.Name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">{showUserDetails.Name}</h4>
                <p className="text-gray-500">User ID: {users.findIndex(u => u.UserID === showUserDetails.UserID) + 1}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">{showUserDetails.Email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">{showUserDetails.Phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <HomeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">{formatAddress(showUserDetails.Address)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CogIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Connection Type</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      showUserDetails.ConnectionType === 'Residential' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {showUserDetails.ConnectionType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowUserDetails(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowUserDetails(null);
                    handleDelete(showUserDetails.UserID);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form for Add/Edit */}
      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm"
          onClick={closeForm}
          aria-modal="true"
          role="dialog"
          aria-labelledby="user-modal-title"
        >
          <div
            ref={modalRef}
            className="glass-card w-full max-w-lg mx-4 rounded-2xl shadow-2xl p-8 animate-scaleIn relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="user-modal-desc"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 id="user-modal-title" className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6" id="user-modal-desc">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="user-name">
                    Full Name
                  </label>
                <input
                  id="user-name"
                  ref={firstInputRef}
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      formErrors.Name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-white'
                    }`}
                    placeholder="Enter full name"
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                  {formErrors.Name && <div className="text-red-500 text-sm mt-2 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {formErrors.Name}
                  </div>}
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="user-phone">
                    Phone Number
                  </label>
                <input
                  id="user-phone"
                    type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      formErrors.Phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-white'
                    }`}
                    placeholder="Enter phone number"
                  required
                  aria-required="true"
                />
                  {formErrors.Phone && <div className="text-red-500 text-sm mt-2 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {formErrors.Phone}
                  </div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="user-email">
                  Email Address
                </label>
                <input
                  id="user-email"
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    formErrors.Email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-white'
                  }`}
                  placeholder="Enter email address"
                  required
                  aria-required="true"
                />
                {formErrors.Email && <div className="text-red-500 text-sm mt-2 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {formErrors.Email}
                </div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="user-address">
                  Address
                </label>
                <input
                  id="user-address"
                  type="text"
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    formErrors.Address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-white'
                  }`}
                  placeholder="Enter complete address"
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.Address && <div className="text-red-500 text-sm mt-2 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {formErrors.Address}
                </div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="user-connection-type">
                  Connection Type
                </label>
                <select
                  id="user-connection-type"
                  name="ConnectionType"
                  value={formData.ConnectionType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    formErrors.ConnectionType ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-white'
                  }`}
                  required
                  aria-required="true"
                >
                  <option value="">Select connection type</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
                {formErrors.ConnectionType && <div className="text-red-500 text-sm mt-2 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {formErrors.ConnectionType}
                </div>}
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      {isEdit ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      {isEdit ? 'Update User' : 'Add User'}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage; 