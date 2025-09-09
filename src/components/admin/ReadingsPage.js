import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { formatDate } from '../../utils/dateFormatter';
import { generateBillFromReading, calculateBillAmount, formatCurrency } from '../../utils/billingUtils';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  SparklesIcon,
  CogIcon,
  BeakerIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import AdminLayout from './AdminLayout';

const initialFormState = {
  ReadingDate: '',
  UnitsConsumed: '',
  ConnectionID: '',
};

const ReadingsPage = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [highConsumptionWarning, setHighConsumptionWarning] = useState(false);
  const [connections, setConnections] = useState([]);
  const [connectionIdError, setConnectionIdError] = useState("");
  const [bills, setBills] = useState([]); // Add bills state for automatic bill generation
  
  // Modern features state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRange, setFilterRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [selectedReadings, setSelectedReadings] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showReadingDetails, setShowReadingDetails] = useState(null);
  
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

  // Resolve a user-entered ConnectionID (which might be an integer like "2")
  // to the actual MongoDB _id of the connection.
  const resolveConnectionObjectId = (inputId) => {
    if (!inputId) return null;

    // If matches an existing connection by ObjectId string
    const byObjectId = connections.find(c => String(c._id) === String(inputId));
    if (byObjectId) return byObjectId._id;

    // If matches a numeric ConnectionID stored in DB
    if (/^\d+$/.test(String(inputId))) {
      const asNumber = parseInt(String(inputId));
      const byNumericId = connections.find(c => String(c.ConnectionID) === String(asNumber));
      if (byNumericId) return byNumericId._id;

      // Fallback: interpret as 1-based index as shown in the table
      if (asNumber >= 1 && asNumber <= connections.length) {
        return connections[asNumber - 1]._id;
      }
    }
    return null;
  };

  // Fetch readings from backend (mocked for demo)
  const fetchReadings = () => {
    setLoading(true);
    
    // Mock readings data for demonstration
    const mockReadings = [
      {
        _id: 'R001',
        ConnectionID: '1',
        ReadingDate: '2024-01-15',
        UnitsConsumed: 120,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: 'R002',
        ConnectionID: '2',
        ReadingDate: '2024-02-10',
        UnitsConsumed: 150,
        createdAt: '2024-02-10T11:00:00Z'
      },
      {
        _id: 'R003',
        ConnectionID: '1',
        ReadingDate: '2024-03-05',
        UnitsConsumed: 130,
        createdAt: '2024-03-05T12:00:00Z'
      },
      {
        _id: 'R004',
        ConnectionID: '3',
        ReadingDate: '2024-03-20',
        UnitsConsumed: 200,
        createdAt: '2024-03-20T13:00:00Z'
      },
      {
        _id: 'R005',
        ConnectionID: '2',
        ReadingDate: '2024-04-12',
        UnitsConsumed: 160,
        createdAt: '2024-04-12T14:00:00Z'
      }
    ];
    
    // Check if readings exist in localStorage first
    const savedReadings = localStorage.getItem('waterSystem_readings');
    
    if (savedReadings) {
      // Load readings from localStorage
      try {
        const parsedReadings = JSON.parse(savedReadings);
        setTimeout(() => {
          setReadings(parsedReadings);
          setError(null);
          setLoading(false);
        }, 500);
        return;
      } catch (error) {
        console.error('Error parsing saved readings:', error);
      }
    }
    
    // Save default readings to localStorage
    localStorage.setItem('waterSystem_readings', JSON.stringify(mockReadings));
    
    // Simulate API call delay
    setTimeout(() => {
      setReadings(mockReadings);
      setError(null);
      setLoading(false);
    }, 1000);
    
    // Uncomment below for real API call
    /*
    fetch('/api/readings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch readings');
        return res.json();
      })
      .then((data) => {
        setReadings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    */
  };

  // Fetch connections for validation (with localStorage persistence)
  const fetchConnections = () => {
    // Check if connections exist in localStorage first
    const savedConnections = localStorage.getItem('waterSystem_connections');
    
    if (savedConnections) {
      // Load connections from localStorage
      try {
        const parsedConnections = JSON.parse(savedConnections);
        setTimeout(() => {
          setConnections(parsedConnections);
        }, 500);
        return;
      } catch (error) {
        console.error('Error parsing saved connections:', error);
      }
    }
    
    // Default mock connections data for first time users
    const defaultConnections = [
      {
        _id: '1',
        ConnectionID: '1',
        UserID: 1,
        MeterNumber: 'M001',
        Status: 'Active',
        ConnectionDate: '2024-01-15'
      },
      {
        _id: '2',
        ConnectionID: '2',
        UserID: 2,
        MeterNumber: 'M002',
        Status: 'Active',
        ConnectionDate: '2024-01-20'
      },
      {
        _id: '3',
        ConnectionID: '3',
        UserID: 3,
        MeterNumber: 'M003',
        Status: 'Inactive',
        ConnectionDate: '2024-02-01'
      }
    ];
    
    // Save default connections to localStorage
    localStorage.setItem('waterSystem_connections', JSON.stringify(defaultConnections));
    
    // Simulate API call delay
    setTimeout(() => {
      setConnections(defaultConnections);
    }, 500);
    
    // Uncomment below for real API call
    /*
    fetch('/api/connections')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch connections');
        return res.json();
      })
      .then((data) => setConnections(data))
      .catch(() => setConnections([]));
    */
  };

  // Fetch bills for automatic bill generation
  const fetchBills = () => {
    // Mock bills data for demonstration
    const mockBills = [
      {
        _id: 'B001',
        BillNumber: 'BILL-00000001',
        BillDate: '2024-01-15',
        DueDate: '2024-02-14',
        Amount: 670.00,
        BaseAmount: 600.00,
        TaxAmount: 48.00,
        ServiceCharge: 10.00,
        UnitsConsumed: 120,
        RatePerUnit: 5.50,
        TaxRate: 0.08,
        PaymentStatus: 'Paid',
        MeterReadingID: 'R001',
        ConnectionID: '1',
        UserID: 1,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        _id: 'B002',
        BillNumber: 'BILL-00000002',
        BillDate: '2024-02-10',
        DueDate: '2024-03-12',
        Amount: 825.00,
        BaseAmount: 750.00,
        TaxAmount: 60.00,
        ServiceCharge: 10.00,
        UnitsConsumed: 150,
        RatePerUnit: 5.50,
        TaxRate: 0.08,
        PaymentStatus: 'Unpaid',
        MeterReadingID: 'R002',
        ConnectionID: '2',
        UserID: 2,
        createdAt: '2024-02-10T11:00:00Z'
      }
    ];
    
    // Simulate API call delay
    setTimeout(() => {
      setBills(mockBills);
    }, 500);
  };

  useEffect(() => {
    fetchReadings();
    fetchConnections();
    fetchBills();
  }, []);

  // Memoized filtered and sorted readings
  const filteredReadings = useMemo(() => {
    let filtered = readings.filter(reading => {
      const matchesSearch = reading.UnitsConsumed?.toString().includes(searchTerm) ||
                           reading.ConnectionID?.toString().includes(searchTerm) ||
                           (reading.ConnectionID && typeof reading.ConnectionID === 'object' ? 
                             reading.ConnectionID.MeterNumber?.toLowerCase().includes(searchTerm.toLowerCase()) :
                             false);
      const matchesFilter = filterRange === 'all' || 
                           (filterRange === 'high' && Number(reading.UnitsConsumed) > 100) ||
                           (filterRange === 'medium' && Number(reading.UnitsConsumed) >= 50 && Number(reading.UnitsConsumed) <= 100) ||
                           (filterRange === 'low' && Number(reading.UnitsConsumed) < 50);
      return matchesSearch && matchesFilter;
    });

    // Sort readings
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.ReadingDate);
          bValue = new Date(b.ReadingDate);
          break;
        case 'units':
          aValue = Number(a.UnitsConsumed);
          bValue = Number(b.UnitsConsumed);
          break;
        case 'connection':
          aValue = typeof a.ConnectionID === 'object' ? a.ConnectionID.MeterNumber?.toLowerCase() || '' : String(a.ConnectionID);
          bValue = typeof b.ConnectionID === 'object' ? b.ConnectionID.MeterNumber?.toLowerCase() || '' : String(b.ConnectionID);
          break;
        default:
          aValue = new Date(a.ReadingDate);
          bValue = new Date(b.ReadingDate);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [readings, searchTerm, filterRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const paginatedReadings = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredReadings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReadings, page, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = readings.length;
    const highConsumption = readings.filter(r => Number(r.UnitsConsumed) > 100).length;
    const mediumConsumption = readings.filter(r => Number(r.UnitsConsumed) >= 50 && Number(r.UnitsConsumed) <= 100).length;
    const lowConsumption = readings.filter(r => Number(r.UnitsConsumed) < 50).length;
    const totalUnits = readings.reduce((sum, r) => sum + Number(r.UnitsConsumed || 0), 0);
    return { total, highConsumption, mediumConsumption, lowConsumption, totalUnits };
  }, [readings]);

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

  useEffect(() => {
    if (!showForm) return;
    if (connections.length === 0) {
      setConnectionIdError('');
      return;
    }
    // ConnectionID validation using resolver; be permissive and let backend decide on submit
    if (formData.ConnectionID && !resolveConnectionObjectId(formData.ConnectionID)) {
      setConnectionIdError('');
    } else {
      setConnectionIdError('');
    }
  }, [formData.UnitsConsumed, formData.ConnectionID, showForm, connections]);

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (reading) => {
    setFormData({
      ReadingDate: reading.ReadingDate,
      UnitsConsumed: reading.UnitsConsumed,
      ConnectionID: reading.ConnectionID ? reading.ConnectionID._id : '',
    });
    setIsEdit(true);
    setEditId(reading._id);
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
    if (!formData.ReadingDate) errors.ReadingDate = 'Reading Date is required';
    if (!formData.UnitsConsumed || isNaN(formData.UnitsConsumed) || Number(formData.UnitsConsumed) < 0) errors.UnitsConsumed = 'Units Consumed must be a non-negative number';
    if (!formData.ConnectionID) errors.ConnectionID = 'Connection ID is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Format ReadingDate to YYYY-MM-DD if needed
      let formattedDate = formData.ReadingDate;
      if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      const resolvedId = resolveConnectionObjectId(formData.ConnectionID) || (typeof formData.ConnectionID === 'object' && formData.ConnectionID?._id ? formData.ConnectionID._id : formData.ConnectionID);
      
      const newReading = {
        _id: `R${Date.now()}`, // Generate unique ID
        ConnectionID: resolvedId,
        ReadingDate: formattedDate,
        UnitsConsumed: Number(formData.UnitsConsumed),
        createdAt: new Date().toISOString()
      };
      
      if (isEdit) {
        // Update existing reading
        const updatedReadings = readings.map(reading => 
          reading._id === editId ? { ...reading, ...newReading } : reading
        );
        setReadings(updatedReadings);
        
        // Save to localStorage for persistence
        localStorage.setItem('waterSystem_readings', JSON.stringify(updatedReadings));
        
        setSuccessMsg('Reading updated successfully!');
      } else {
        // Add new reading
        const updatedReadings = [...readings, newReading];
        setReadings(updatedReadings);
        
        // Save to localStorage for persistence
        localStorage.setItem('waterSystem_readings', JSON.stringify(updatedReadings));
        
        // Automatically generate bill for new reading
        const connection = connections.find(conn => 
          conn._id === resolvedId || conn.ConnectionID === resolvedId
        );
        
        if (connection && newReading.UnitsConsumed > 0) {
          const generatedBill = generateBillFromReading(newReading, connection);
          setBills(prev => [...prev, generatedBill]);
          
          // Save bills to localStorage for persistence
          const updatedBills = [...bills, generatedBill];
          localStorage.setItem('waterSystem_bills', JSON.stringify(updatedBills));
          
          // Show bill generation success message
          const billAmount = formatCurrency(generatedBill.Amount);
          setSuccessMsg(`Reading added successfully! Bill generated: ${billAmount}`);
        } else {
          setSuccessMsg('Reading added successfully!');
        }
      }
      
      // Show warning after submit if high consumption
      const units = Number(formData.UnitsConsumed);
      setHighConsumptionWarning(!isNaN(units) && units > 100);
      
      // Simulate alert for high consumption (no real API call)
      if (!isNaN(units) && units > 100) {
        console.log(`High consumption alert: ${units} units for ConnectionID ${formData.ConnectionID}`);
      }
      
      closeForm();
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Uncomment below for real API call
      /*
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/readings/${editId}` : '/api/readings';
      const requestData = {
        ...formData,
        ConnectionID: resolvedId,
        ReadingDate: formattedDate,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!res.ok) throw new Error('Failed to save reading');
      fetchReadings();
      */
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;
    try {
      const res = await fetch(`/api/readings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete reading');
      fetchReadings();
      setSuccessMsg('Reading deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const handleSelectReading = useCallback((readingId) => {
    setSelectedReadings(prev => 
      prev.includes(readingId) 
        ? prev.filter(id => id !== readingId)
        : [...prev, readingId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedReadings.length === paginatedReadings.length) {
      setSelectedReadings([]);
    } else {
      setSelectedReadings(paginatedReadings.map(reading => reading._id));
    }
  }, [selectedReadings.length, paginatedReadings]);

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedReadings.length} readings?`)) return;
    try {
      await Promise.all(
        selectedReadings.map(readingId => 
          fetch(`/api/readings/${readingId}`, { method: 'DELETE' })
        )
      );
      fetchReadings();
      setSelectedReadings([]);
      setSuccessMsg(`${selectedReadings.length} readings deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to delete some readings');
    }
  }, [selectedReadings]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterRange('all');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  }, []);

  return (
    <AdminLayout currentPage="readings" hideHeader={showReadingDetails || showForm}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-float animation-delay-200"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float animation-delay-400"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-3xl animate-float animation-delay-300"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-emerald-50/40"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
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

          {/* Warning Message */}
          {highConsumptionWarning && (
            <div className="fixed top-16 right-4 z-[10000] bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Warning: High consumption detected!</span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Meter Readings
                </h1>
                <p className="text-gray-600 text-lg">Manage meter readings and consumption data with advanced analytics</p>
      </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ChartBarIcon className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={fetchReadings}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowPathIcon className="h-6 w-6 text-gray-600" />
                </button>
        <button
          onClick={openAddForm}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Reading</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Readings</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent animate-gradient">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ChartBarIcon className="h-8 w-8 text-white animate-float" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-emerald-200 to-emerald-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-shimmer"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-200 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">High Consumption</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent animate-gradient">{stats.highConsumption}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ExclamationTriangleIcon className="h-8 w-8 text-white animate-float animation-delay-200" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-red-200 to-red-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-shimmer animation-delay-200"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-400 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Medium Consumption</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent animate-gradient">{stats.mediumConsumption}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ClockIcon className="h-8 w-8 text-white animate-float animation-delay-400" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full animate-shimmer animation-delay-400"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scaleIn animation-delay-500 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Units</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent animate-gradient">{stats.totalUnits}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BoltIcon className="h-8 w-8 text-white animate-float animation-delay-500" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-teal-200 to-teal-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full animate-shimmer animation-delay-500"></div>
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
                    placeholder="Search readings by units, connection, or meter number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={filterRange}
                    onChange={(e) => setFilterRange(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                  >
                    <option value="all">All Consumption</option>
                    <option value="high">High (&gt;100 units)</option>
                    <option value="medium">Medium (50-100 units)</option>
                    <option value="low">Low (&lt;50 units)</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="units-desc">Units (High to Low)</option>
                    <option value="units-asc">Units (Low to High)</option>
                    <option value="connection-asc">Connection A-Z</option>
                    <option value="connection-desc">Connection Z-A</option>
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
              {selectedReadings.length > 0 && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-medium">
                      {selectedReadings.length} reading{selectedReadings.length > 1 ? 's' : ''} selected
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
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mt-4 animate-pulse-slow">Loading readings...</p>
                  <p className="text-sm text-gray-500 animate-fadeIn animation-delay-200">Please wait while we fetch the data</p>
                </div>
              </div>
        ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Readings</p>
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchReadings}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
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
                      {paginatedReadings.map((reading, index) => (
                        <div
                          key={reading._id}
                          className={`glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 border-2 ${
                            selectedReadings.includes(reading._id) 
                              ? 'border-emerald-500 bg-emerald-50/50' 
                              : 'border-transparent hover:border-white/50'
                          } animate-scaleIn group`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedReadings.includes(reading._id)}
                                onChange={() => handleSelectReading(reading._id)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                              />
                              <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {reading.UnitsConsumed?.toString().charAt(0) || 'R'}
                                </span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              Number(reading.UnitsConsumed) > 100 
                                ? 'bg-red-100 text-red-700' 
                                : Number(reading.UnitsConsumed) >= 50 
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {Number(reading.UnitsConsumed) > 100 ? 'High' : Number(reading.UnitsConsumed) >= 50 ? 'Medium' : 'Low'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{reading.UnitsConsumed} Units</h3>
                              <p className="text-gray-500 text-sm">Reading ID: {index + 1}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{formatDate(reading.ReadingDate)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CogIcon className="h-4 w-4" />
                                <span className="truncate">
                                  {reading.ConnectionID ? (typeof reading.ConnectionID === 'object' ? reading.ConnectionID.MeterNumber || reading.ConnectionID._id : reading.ConnectionID) : 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setShowReadingDetails(reading)}
                                className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => openEditForm(reading)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(reading._id)}
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
                              checked={selectedReadings.length === paginatedReadings.length && paginatedReadings.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reading
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Units Consumed
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Connection
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
              </tr>
            </thead>
                      <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/20">
                        {paginatedReadings.map((reading, index) => (
                          <tr
                            key={reading._id}
                            className={`hover:bg-white/10 transition-all duration-300 ${
                              selectedReadings.includes(reading._id) ? 'bg-emerald-50/30' : ''
                            } animate-fadeIn`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedReadings.includes(reading._id)}
                                onChange={() => handleSelectReading(reading._id)}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                  <span className="text-white font-bold">
                                    {reading.UnitsConsumed?.toString().charAt(0) || 'R'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">Reading #{index + 1}</div>
                                  <div className="text-sm text-gray-500">ID: {reading._id.slice(-6)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{reading.UnitsConsumed} units</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {reading.ConnectionID ? (typeof reading.ConnectionID === 'object' ? reading.ConnectionID.MeterNumber || reading.ConnectionID._id : reading.ConnectionID) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatDate(reading.ReadingDate)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                Number(reading.UnitsConsumed) > 100 
                                  ? 'bg-red-100 text-red-700' 
                                  : Number(reading.UnitsConsumed) >= 50 
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {Number(reading.UnitsConsumed) > 100 ? 'High' : Number(reading.UnitsConsumed) >= 50 ? 'Medium' : 'Low'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setShowReadingDetails(reading)}
                                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openEditForm(reading)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(reading._id)}
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
                        Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredReadings.length)} of {filteredReadings.length} readings
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
                                ? 'bg-emerald-500 text-white'
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

          {/* Reading Details Modal */}
          {showReadingDetails && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
              <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Reading Details</h3>
                  <button
                    onClick={() => setShowReadingDetails(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-white font-bold text-2xl">
                        {showReadingDetails.UnitsConsumed?.toString().charAt(0) || 'R'}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">{showReadingDetails.UnitsConsumed} Units Consumed</h4>
                    <p className="text-gray-500">Reading ID: {readings.findIndex(r => r._id === showReadingDetails._id) + 1}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Reading Date</p>
                        <p className="text-gray-600">{formatDate(showReadingDetails.ReadingDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Units Consumed</p>
                        <p className="text-gray-600">{showReadingDetails.UnitsConsumed} units</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CogIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Connection</p>
                        <p className="text-gray-600">
                          {showReadingDetails.ConnectionID ? (typeof showReadingDetails.ConnectionID === 'object' ? showReadingDetails.ConnectionID.MeterNumber || showReadingDetails.ConnectionID._id : showReadingDetails.ConnectionID) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Consumption Level</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          Number(showReadingDetails.UnitsConsumed) > 100 
                            ? 'bg-red-100 text-red-700' 
                            : Number(showReadingDetails.UnitsConsumed) >= 50 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {Number(showReadingDetails.UnitsConsumed) > 100 ? 'High Consumption' : Number(showReadingDetails.UnitsConsumed) >= 50 ? 'Medium Consumption' : 'Low Consumption'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowReadingDetails(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowReadingDetails(null);
                        openEditForm(showReadingDetails);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Edit Reading
                    </button>
                    <button
                      onClick={() => {
                        setShowReadingDetails(null);
                        handleDelete(showReadingDetails._id);
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
                className="glass-card w-full max-w-lg mx-4 rounded-2xl p-8 shadow-2xl animate-scaleIn relative focus:outline-none"
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
          aria-modal="true"
          role="dialog"
          aria-labelledby="reading-modal-title"
        >
                <div className="flex items-center justify-between mb-6">
                  <h3 id="reading-modal-title" className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {isEdit ? 'Edit Reading' : 'Add New Reading'}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" id="reading-modal-desc">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="reading-date">
                        <CalendarIcon className="h-4 w-4 inline mr-2" />
                        Reading Date
                      </label>
                <input
                  id="reading-date"
                  ref={firstInputRef}
                  type="date"
                  name="ReadingDate"
                  value={formData.ReadingDate}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
                          formErrors.ReadingDate ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                      {formErrors.ReadingDate && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {formErrors.ReadingDate}
                      </div>}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="units-consumed">
                        <BoltIcon className="h-4 w-4 inline mr-2" />
                        Units Consumed
                      </label>
                <input
                  id="units-consumed"
                  type="number"
                  name="UnitsConsumed"
                  value={formData.UnitsConsumed}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
                          formErrors.UnitsConsumed || highConsumptionWarning ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                  required
                  aria-required="true"
                  min="0"
                        placeholder="Enter units consumed"
                      />
                      {formErrors.UnitsConsumed && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {formErrors.UnitsConsumed}
                      </div>}
                      {highConsumptionWarning && (
                        <div className="text-orange-600 text-sm mt-1 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          High consumption detected! An alert will be created.
                        </div>
                      )}
                      
                      {/* Bill Calculation Preview */}
                      {formData.UnitsConsumed && !isNaN(formData.UnitsConsumed) && Number(formData.UnitsConsumed) > 0 && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <SparklesIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Bill Preview</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Units:</span>
                              <span className="font-medium">{formData.UnitsConsumed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rate per unit:</span>
                              <span className="font-medium">$5.50</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Base amount:</span>
                              <span className="font-medium">{formatCurrency(Number(formData.UnitsConsumed) * 5.50)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Service charge:</span>
                              <span className="font-medium">$10.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax (8%):</span>
                              <span className="font-medium">{formatCurrency((Number(formData.UnitsConsumed) * 5.50) * 0.08)}</span>
                            </div>
                            <div className="border-t border-blue-200 pt-1 mt-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-blue-800">Total Bill:</span>
                                <span className="font-bold text-blue-800">{formatCurrency(calculateBillAmount(Number(formData.UnitsConsumed)).totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-blue-600">
                            💡 Bill will be automatically generated after saving this reading
                          </div>
                        </div>
                      )}
                    </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="connection-id">
                      <CogIcon className="h-4 w-4 inline mr-2" />
                      Connection ID
                    </label>
                <input
                  id="connection-id"
                  type="number"
                  name="ConnectionID"
                  value={formData.ConnectionID}
                  onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.ConnectionID || connectionIdError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                  required
                  aria-required="true"
                  min="1"
                      placeholder="Enter connection ID"
                    />
                    {formErrors.ConnectionID && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {formErrors.ConnectionID}
                    </div>}
                    {connectionIdError && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {connectionIdError}
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submitting || highConsumptionWarning}
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>{isEdit ? 'Updating...' : 'Adding...'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <SparklesIcon className="h-4 w-4" />
                          <span>{isEdit ? 'Update Reading' : 'Add Reading'}</span>
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

export default ReadingsPage; 