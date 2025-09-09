import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  BeakerIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  SparklesIcon,
  CogIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  MapPinIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import AdminLayout from './AdminLayout';

const initialFormState = { Name: '', Type: '', Capacity: '' };

const placeholderSources = [
  { SourceID: 1, Name: 'River A', Type: 'River', Capacity: 10000 },
  { SourceID: 2, Name: 'Lake B', Type: 'Lake', Capacity: 8000 },
  { SourceID: 3, Name: 'Well C', Type: 'Well', Capacity: 2000 },
];

const SourcesPage = () => {
  const [sources, setSources] = useState(placeholderSources);
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
  const [selectedSources, setSelectedSources] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showSourceDetails, setShowSourceDetails] = useState(null);
  
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch sources from backend
  const fetchSources = () => {
    setLoading(true);
    fetch('/api/water-sources')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch water sources');
        return res.json();
      })
      .then(data => {
        setSources(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // Memoized filtered and sorted sources
  const filteredSources = useMemo(() => {
    let filtered = sources.filter(source => {
      const matchesSearch = source.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.Type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.Capacity?.toString().includes(searchTerm);
      const matchesFilter = filterType === 'all' || source.Type === filterType;
      return matchesSearch && matchesFilter;
    });

    // Sort sources
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.Name?.toLowerCase() || '';
          bValue = b.Name?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.Type?.toLowerCase() || '';
          bValue = b.Type?.toLowerCase() || '';
          break;
        case 'capacity':
          aValue = Number(a.Capacity);
          bValue = Number(b.Capacity);
          break;
        default:
          aValue = a.Name?.toLowerCase() || '';
          bValue = b.Name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [sources, searchTerm, filterType, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  const paginatedSources = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredSources.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSources, page, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = sources.length;
    const river = sources.filter(s => s.Type === 'River').length;
    const lake = sources.filter(s => s.Type === 'Lake').length;
    const well = sources.filter(s => s.Type === 'Well').length;
    const totalCapacity = sources.reduce((sum, s) => sum + Number(s.Capacity || 0), 0);
    return { total, river, lake, well, totalCapacity };
  }, [sources]);

  useEffect(() => {
    if (showForm && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeForm(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  // Focus trap for modal
  useEffect(() => {
    if (!showForm) return;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    if (!modal) return;
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

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (source) => {
    setFormData({ Name: source.Name, Type: source.Type, Capacity: source.Capacity });
    setIsEdit(true);
    setEditId(source._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.Name.trim()) errors.Name = 'Name is required';
    if (!formData.Type.trim()) errors.Type = 'Type is required';
    if (!formData.Capacity || isNaN(formData.Capacity) || Number(formData.Capacity) < 0) errors.Capacity = 'Capacity must be a non-negative number';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    if (isEdit) {
      // Edit water source via API
      fetch(`/api/water-sources/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update water source');
          return res.json();
        })
        .then(updated => {
          setSources(prev => prev.map(source => source._id === editId ? updated : source));
          setSuccessMsg('Water source updated successfully!');
          closeForm();
          setTimeout(() => setSuccessMsg(''), 3000);
        })
        .catch(err => {
          setFormErrors({ api: err.message });
        })
        .finally(() => setSubmitting(false));
    } else {
      // Add water source via API
      fetch('/api/water-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add water source');
          return res.json();
        })
        .then(added => {
          setSources(prev => [...prev, added]);
          setSuccessMsg('Water source added successfully!');
          closeForm();
          setTimeout(() => setSuccessMsg(''), 3000);
        })
        .catch(err => {
          setFormErrors({ api: err.message });
        })
        .finally(() => setSubmitting(false));
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this water source?')) return;
    try {
      const res = await fetch(`/api/water-sources/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete water source');
      setSources(prev => prev.filter(s => s._id !== id));
      setSuccessMsg('Water source deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleSelectSource = useCallback((sourceId) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedSources.length === paginatedSources.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(paginatedSources.map(source => source._id));
    }
  }, [selectedSources.length, paginatedSources]);

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedSources.length} water sources?`)) return;
    try {
      await Promise.all(
        selectedSources.map(sourceId => 
          fetch(`/api/water-sources/${sourceId}`, { method: 'DELETE' })
        )
      );
      setSources(prev => prev.filter(s => !selectedSources.includes(s._id)));
      setSelectedSources([]);
      setSuccessMsg(`${selectedSources.length} water sources deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to delete some water sources');
    }
  }, [selectedSources]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  }, []);

  return (
    <AdminLayout currentPage="sources" hideHeader={showSourceDetails || showForm}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-spin-slow"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-sky-400/20 to-cyan-400/20 rounded-full blur-3xl animate-spin-slow animation-delay-200"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-spin-slow animation-delay-400"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-spin-slow animation-delay-300"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-cyan-50/40"></div>
          
          {/* Animated Ripple Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
              `,
              animation: 'rippleMove 12s ease-in-out infinite'
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <style jsx>{`
            @keyframes fadeInDown {
              from { opacity: 0; transform: translateY(-30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideInLeft {
              from { opacity: 0; transform: translateX(-30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes rotateIn {
              from { opacity: 0; transform: rotate(-180deg) scale(0.8); }
              to { opacity: 1; transform: rotate(0deg) scale(1); }
            }
            @keyframes spin-slow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes rippleMove {
              0%, 100% { transform: scale(1) rotate(0deg); }
              25% { transform: scale(1.1) rotate(90deg); }
              50% { transform: scale(0.9) rotate(180deg); }
              75% { transform: scale(1.05) rotate(270deg); }
            }
            @keyframes shimmer-ripple {
              0% { transform: translateX(-100%) rotate(0deg); }
              100% { transform: translateX(200%) rotate(360deg); }
            }
            @keyframes gradient-spin {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-fadeInDown { animation: fadeInDown 0.8s ease-out; }
            .animate-slideInLeft { animation: slideInLeft 0.8s ease-out; }
            .animate-rotateIn { animation: rotateIn 0.8s ease-out; }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            .animate-shimmer-ripple { animation: shimmer-ripple 4s ease-in-out infinite; }
            .animate-gradient-spin { 
              background-size: 200% 200%;
              animation: gradient-spin 12s ease infinite;
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
            <div className="fixed top-4 right-4 z-[10000] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeInDown">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="mb-8 animate-fadeInDown">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Water Sources
                </h1>
                <p className="text-gray-600 text-lg">Manage water sources and capacity information with environmental insights</p>
      </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <BeakerIcon className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={fetchSources}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowPathIcon className="h-6 w-6 text-gray-600" />
                </button>
        <button
          onClick={openAddForm}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Source</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-rotateIn group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Sources</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent animate-gradient-spin">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BeakerIcon className="h-8 w-8 text-white animate-spin-slow" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-cyan-200 to-cyan-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full animate-shimmer-ripple"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-rotateIn animation-delay-200 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Rivers</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-gradient-spin">{stats.river}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <MapPinIcon className="h-8 w-8 text-white animate-spin-slow animation-delay-200" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-shimmer-ripple animation-delay-200"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-rotateIn animation-delay-400 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Lakes</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent animate-gradient-spin">{stats.lake}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <HomeIcon className="h-8 w-8 text-white animate-spin-slow animation-delay-400" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-sky-200 to-sky-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full animate-shimmer-ripple animation-delay-400"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-rotateIn animation-delay-500 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Capacity</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent animate-gradient-spin">{stats.totalCapacity}L</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BoltIcon className="h-8 w-8 text-white animate-spin-slow animation-delay-500" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-indigo-200 to-indigo-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-shimmer-ripple animation-delay-500"></div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="glass-card rounded-2xl p-6 mb-6 animate-slideInLeft">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sources by name, type, or capacity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                  >
                    <option value="all">All Types</option>
                    <option value="River">River</option>
                    <option value="Lake">Lake</option>
                    <option value="Well">Well</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                  >
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="type-asc">Type A-Z</option>
                    <option value="type-desc">Type Z-A</option>
                    <option value="capacity-desc">Capacity (High to Low)</option>
                    <option value="capacity-asc">Capacity (Low to High)</option>
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
              {selectedSources.length > 0 && (
                <div className="mt-4 p-4 bg-cyan-50 rounded-xl border border-cyan-200 animate-fadeInDown">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-700 font-medium">
                      {selectedSources.length} source{selectedSources.length > 1 ? 's' : ''} selected
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
          <div className="glass-card rounded-2xl overflow-hidden animate-fadeInDown">
        {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mt-4 animate-spin-slow">Loading water sources...</p>
                  <p className="text-sm text-gray-500 animate-fadeInDown animation-delay-200">Please wait while we fetch the data</p>
                </div>
              </div>
        ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Sources</p>
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchSources}
                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
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
                      {paginatedSources.map((source, index) => (
                        <div
                          key={source._id}
                          className={`glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 border-2 ${
                            selectedSources.includes(source._id) 
                              ? 'border-cyan-500 bg-cyan-50/50' 
                              : 'border-transparent hover:border-white/50'
                          } animate-rotateIn group`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedSources.includes(source._id)}
                                onChange={() => handleSelectSource(source._id)}
                                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                              />
                              <div className="h-12 w-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {source.Name?.charAt(0) || 'S'}
                                </span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              source.Type === 'River' 
                                ? 'bg-blue-100 text-blue-700' 
                                : source.Type === 'Lake'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {source.Type}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{source.Name}</h3>
                              <p className="text-gray-500 text-sm">Source ID: {index + 1}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BeakerIcon className="h-4 w-4" />
                                <span>{source.Type}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BoltIcon className="h-4 w-4" />
                                <span>{source.Capacity}L capacity</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setShowSourceDetails(source)}
                                className="flex items-center space-x-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => openEditForm(source)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(source._id)}
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
                              checked={selectedSources.length === paginatedSources.length && paginatedSources.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Capacity
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
              </tr>
            </thead>
                      <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/20">
                        {paginatedSources.map((source, index) => (
                          <tr
                            key={source._id}
                            className={`hover:bg-white/10 transition-all duration-300 ${
                              selectedSources.includes(source._id) ? 'bg-cyan-50/30' : ''
                            } animate-fadeInDown`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedSources.includes(source._id)}
                                onChange={() => handleSelectSource(source._id)}
                                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-sky-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                  <span className="text-white font-bold">
                                    {source.Name?.charAt(0) || 'S'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{source.Name}</div>
                                  <div className="text-sm text-gray-500">ID: {source._id.slice(-6)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                source.Type === 'River' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : source.Type === 'Lake'
                                  ? 'bg-sky-100 text-sky-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {source.Type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{source.Capacity}L</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setShowSourceDetails(source)}
                                  className="p-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-all duration-200"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                    <button
                      onClick={() => openEditForm(source)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                                  <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                                  onClick={() => handleDelete(source._id)}
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
                        Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredSources.length)} of {filteredSources.length} sources
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
                                ? 'bg-cyan-500 text-white'
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

          {/* Source Details Modal */}
          {showSourceDetails && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
              <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-rotateIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Source Details</h3>
                  <button
                    onClick={() => setShowSourceDetails(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-white font-bold text-2xl">
                        {showSourceDetails.Name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">{showSourceDetails.Name}</h4>
                    <p className="text-gray-500">Source ID: {sources.findIndex(s => s._id === showSourceDetails._id) + 1}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <BeakerIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Source Name</p>
                        <p className="text-gray-600">{showSourceDetails.Name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <WrenchScrewdriverIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Type</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          showSourceDetails.Type === 'River' 
                            ? 'bg-blue-100 text-blue-700' 
                            : showSourceDetails.Type === 'Lake'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {showSourceDetails.Type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Capacity</p>
                        <p className="text-gray-600">{showSourceDetails.Capacity}L</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowSourceDetails(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowSourceDetails(null);
                        openEditForm(showSourceDetails);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Edit Source
                    </button>
                    <button
                      onClick={() => {
                        setShowSourceDetails(null);
                        handleDelete(showSourceDetails._id);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Modal Form for Add/Edit */}
      {showForm && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
              <div
                ref={modalRef}
                className="glass-card w-full max-w-lg mx-4 rounded-2xl p-8 shadow-2xl animate-rotateIn relative focus:outline-none"
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
          aria-modal="true"
          role="dialog"
          aria-labelledby="source-modal-title"
        >
                <div className="flex items-center justify-between mb-6">
                  <h3 id="source-modal-title" className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {isEdit ? 'Edit Water Source' : 'Add Water Source'}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" id="source-modal-desc">
                  {formErrors.api && <div className="text-red-500 text-sm mb-2 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {formErrors.api}
                  </div>}
                  
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                      <BeakerIcon className="h-4 w-4 inline mr-2" />
                      Source Name
                    </label>
                <input
                  id="name"
                  ref={firstInputRef}
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.Name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                      placeholder="Enter source name"
                />
                    {formErrors.Name && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {formErrors.Name}
                    </div>}
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">
                      <WrenchScrewdriverIcon className="h-4 w-4 inline mr-2" />
                      Source Type
                    </label>
                    <select
                  id="type"
                  name="Type"
                  value={formData.Type}
                  onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.Type ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                    >
                      <option value="">Select Source Type</option>
                      <option value="River">River</option>
                      <option value="Lake">Lake</option>
                      <option value="Well">Well</option>
                      <option value="Reservoir">Reservoir</option>
                      <option value="Spring">Spring</option>
                    </select>
                    {formErrors.Type && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {formErrors.Type}
                    </div>}
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="capacity">
                      <BoltIcon className="h-4 w-4 inline mr-2" />
                      Capacity (Liters)
                    </label>
                <input
                  id="capacity"
                  type="number"
                  name="Capacity"
                  value={formData.Capacity}
                  onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.Capacity ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                  required
                  aria-required="true"
                  min="0"
                      step="100"
                      placeholder="Enter capacity in liters"
                />
                    {formErrors.Capacity && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {formErrors.Capacity}
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                      {submitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>{isEdit ? 'Updating...' : 'Adding...'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <SparklesIcon className="h-4 w-4" />
                          <span>{isEdit ? 'Update Source' : 'Add Source'}</span>
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

export default SourcesPage; 