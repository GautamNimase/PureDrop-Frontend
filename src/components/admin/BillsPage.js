import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';
import { generateBillFromReading, calculateBillAmount, formatCurrency } from '../../utils/billingUtils';
import { 
  CurrencyDollarIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
  BanknotesIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import AdminLayout from './AdminLayout';

const initialFormState = {
  BillDate: '',
  Amount: '',
  PaymentStatus: '',
  MeterReadingID: '',
};

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [meterReadings, setMeterReadings] = useState([]);
  const [overdueWarning, setOverdueWarning] = useState(false);
  
  // Modern features state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [selectedBills, setSelectedBills] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showBillDetails, setShowBillDetails] = useState(null);
  
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch bills from backend (mocked for demo)
  const fetchBills = () => {
    setLoading(true);
    
    // Mock bills data for demonstration - includes bills generated from readings
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
      },
      {
        _id: 'B003',
        BillNumber: 'BILL-00000003',
        BillDate: '2024-03-05',
        DueDate: '2024-04-04',
        Amount: 715.00,
        BaseAmount: 650.00,
        TaxAmount: 52.00,
        ServiceCharge: 10.00,
        UnitsConsumed: 130,
        RatePerUnit: 5.50,
        TaxRate: 0.08,
        PaymentStatus: 'Unpaid',
        MeterReadingID: 'R003',
        ConnectionID: '1',
        UserID: 1,
        createdAt: '2024-03-05T12:00:00Z'
      },
      {
        _id: 'B004',
        BillNumber: 'BILL-00000004',
        BillDate: '2024-03-20',
        DueDate: '2024-04-19',
        Amount: 1100.00,
        BaseAmount: 1000.00,
        TaxAmount: 80.00,
        ServiceCharge: 10.00,
        UnitsConsumed: 200,
        RatePerUnit: 5.50,
        TaxRate: 0.08,
        PaymentStatus: 'Overdue',
        MeterReadingID: 'R004',
        ConnectionID: '3',
        UserID: 3,
        createdAt: '2024-03-20T13:00:00Z'
      },
      {
        _id: 'B005',
        BillNumber: 'BILL-00000005',
        BillDate: '2024-04-12',
        DueDate: '2024-05-12',
        Amount: 880.00,
        BaseAmount: 800.00,
        TaxAmount: 64.00,
        ServiceCharge: 10.00,
        UnitsConsumed: 160,
        RatePerUnit: 5.50,
        TaxRate: 0.08,
        PaymentStatus: 'Unpaid',
        MeterReadingID: 'R005',
        ConnectionID: '2',
        UserID: 2,
        createdAt: '2024-04-12T14:00:00Z'
      }
    ];
    
    // Check if bills exist in localStorage first
    const savedBills = localStorage.getItem('waterSystem_bills');
    
    if (savedBills) {
      // Load bills from localStorage
      try {
        const parsedBills = JSON.parse(savedBills);
        setTimeout(() => {
          setBills(parsedBills);
          setError(null);
          setLoading(false);
        }, 500);
        return;
      } catch (error) {
        console.error('Error parsing saved bills:', error);
      }
    }
    
    // Save default bills to localStorage
    localStorage.setItem('waterSystem_bills', JSON.stringify(mockBills));
    
    // Simulate API call delay
    setTimeout(() => {
      setBills(mockBills);
      setError(null);
      setLoading(false);
    }, 1000);
    
    // Uncomment below for real API call
    /*
    fetch('/api/bills')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch bills');
        return res.json();
      })
      .then((data) => {
        setBills(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    */
  };

  // Fetch meter readings for dropdown (mocked for demo)
  const fetchMeterReadings = () => {
    // Mock meter readings data for demonstration
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
      },
      {
        _id: 'R006',
        ConnectionID: '1',
        ReadingDate: '2024-05-01',
        UnitsConsumed: 110,
        createdAt: '2024-05-01T15:00:00Z'
      },
      {
        _id: 'R007',
        ConnectionID: '2',
        ReadingDate: '2024-05-15',
        UnitsConsumed: 140,
        createdAt: '2024-05-15T16:00:00Z'
      }
    ];
    
    // Simulate API call delay
    setTimeout(() => {
      setMeterReadings(mockReadings);
    }, 500);
    
    // Uncomment below for real API call
    /*
    fetch('/api/readings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch meter readings');
        return res.json();
      })
      .then((data) => setMeterReadings(data))
      .catch(() => setMeterReadings([]));
    */
  };

  useEffect(() => {
    fetchBills();
    fetchMeterReadings();
  }, []);

  // Memoized filtered and sorted bills
  const filteredBills = useMemo(() => {
    let filtered = bills.filter(bill => {
      const matchesSearch = bill.Amount?.toString().includes(searchTerm) ||
                           bill.PaymentStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.MeterReadingID?.toString().includes(searchTerm);
      const matchesFilter = filterStatus === 'all' || bill.PaymentStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });

    // Sort bills
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.BillDate);
          bValue = new Date(b.BillDate);
          break;
        case 'amount':
          aValue = Number(a.Amount);
          bValue = Number(b.Amount);
          break;
        case 'status':
          aValue = a.PaymentStatus?.toLowerCase() || '';
          bValue = b.PaymentStatus?.toLowerCase() || '';
          break;
        case 'overdue':
          aValue = a.overdueDays || 0;
          bValue = b.overdueDays || 0;
          break;
        default:
          aValue = new Date(a.BillDate);
          bValue = new Date(b.BillDate);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [bills, searchTerm, filterStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredBills.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBills, page, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = bills.length;
    const paid = bills.filter(b => b.PaymentStatus === 'Paid').length;
    const unpaid = bills.filter(b => b.PaymentStatus === 'Unpaid').length;
    const overdue = bills.filter(b => b.PaymentStatus === 'Overdue').length;
    const totalAmount = bills.reduce((sum, b) => sum + Number(b.Amount || 0), 0);
    const paidAmount = bills.filter(b => b.PaymentStatus === 'Paid').reduce((sum, b) => sum + Number(b.Amount || 0), 0);
    return { total, paid, unpaid, overdue, totalAmount, paidAmount };
  }, [bills]);

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

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (bill) => {
    setFormData({
      BillDate: bill.BillDate,
      Amount: bill.Amount,
      PaymentStatus: bill.PaymentStatus,
      MeterReadingID: bill.MeterReadingID ? bill.MeterReadingID._id : '',
    });
    setIsEdit(true);
    setEditId(bill.BillID);
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
    if (!formData.BillDate) errors.BillDate = 'Bill Date is required';
    if (!formData.PaymentStatus.trim()) errors.PaymentStatus = 'Payment Status is required';
    if (!formData.MeterReadingID) errors.MeterReadingID = 'Meter Reading is required';
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
      
      // Format BillDate to YYYY-MM-DD if needed
      let formattedDate = formData.BillDate;
      if (/^\d{2}-\d{2}-\d{4}$/.test(formData.BillDate)) {
        const [day, month, year] = formData.BillDate.split('-');
        formattedDate = `${year}-${month}-${day}`;
      }

      const newBill = {
        _id: `B${Date.now()}`, // Generate unique bill ID
        BillNumber: `BILL-${Date.now().toString().slice(-8)}`,
        BillDate: formattedDate,
        DueDate: new Date(new Date(formattedDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
        Amount: Number(formData.Amount) || 0,
        PaymentStatus: formData.PaymentStatus,
        MeterReadingID: formData.MeterReadingID,
        createdAt: new Date().toISOString()
      };
      
      if (isEdit) {
        // Update existing bill
        const updatedBills = bills.map(bill => 
          bill._id === editId ? { ...bill, ...newBill } : bill
        );
        setBills(updatedBills);
        
        // Save to localStorage for persistence
        localStorage.setItem('waterSystem_bills', JSON.stringify(updatedBills));
        
        setSuccessMsg('Bill updated successfully!');
      } else {
        // Add new bill
        const updatedBills = [...bills, newBill];
        setBills(updatedBills);
        
        // Save to localStorage for persistence
        localStorage.setItem('waterSystem_bills', JSON.stringify(updatedBills));
        
        setSuccessMsg('Bill added successfully!');
      }
      
      closeForm();
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Uncomment below for real API call
      /*
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/bills/${editId}` : '/api/bills';
      const requestData = {
        BillDate: formattedDate,
        PaymentStatus: formData.PaymentStatus,
        MeterReadingID: formData.MeterReadingID,
        Amount: formData.Amount !== undefined && formData.Amount !== '' ? Number(formData.Amount) : 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save bill');
      }

      fetchBills();
      */
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove bill from local state
      const updatedBills = bills.filter(bill => bill._id !== id);
      setBills(updatedBills);
      
      // Save to localStorage for persistence
      localStorage.setItem('waterSystem_bills', JSON.stringify(updatedBills));
      
      setSuccessMsg('Bill deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Uncomment below for real API call
      /*
      const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete bill');
      fetchBills();
      */
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const handleSelectBill = useCallback((billId) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBills.length === paginatedBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(paginatedBills.map(bill => bill.BillID || bill._id));
    }
  }, [selectedBills.length, paginatedBills]);

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedBills.length} bills?`)) return;
    try {
      await Promise.all(
        selectedBills.map(billId => 
          fetch(`/api/bills/${billId}`, { method: 'DELETE' })
        )
      );
      fetchBills();
      setSelectedBills([]);
      setSuccessMsg(`${selectedBills.length} bills deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to delete some bills');
    }
  }, [selectedBills]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  }, []);

  return (
    <AdminLayout currentPage="bills" hideHeader={showBillDetails || showForm}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce-slow"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl animate-bounce-slow animation-delay-200"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-bounce-slow animation-delay-400"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce-slow animation-delay-300"></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-violet-50/40"></div>
          
          {/* Animated Wave Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
              `,
              animation: 'waveMove 15s ease-in-out infinite'
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <style jsx>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(30px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes zoomIn {
              from { opacity: 0; transform: scale(0.8); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes waveMove {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              25% { transform: translate(10px, -10px) rotate(1deg); }
              50% { transform: translate(-5px, 5px) rotate(-1deg); }
              75% { transform: translate(5px, -5px) rotate(0.5deg); }
            }
            @keyframes shimmer-wave {
              0% { transform: translateX(-100%) skewX(-15deg); }
              100% { transform: translateX(200%) skewX(-15deg); }
            }
            @keyframes gradient-flow {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
            .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
            .animate-zoomIn { animation: zoomIn 0.8s ease-out; }
            .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
            .animate-shimmer-wave { animation: shimmer-wave 3s ease-in-out infinite; }
            .animate-gradient-flow { 
              background-size: 200% 200%;
              animation: gradient-flow 10s ease infinite;
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
            <div className="fixed top-4 right-4 z-[10000] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeInUp">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Warning Message */}
          {overdueWarning && (
            <div className="fixed top-16 right-4 z-[10000] bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeInUp">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Warning: Your bill is overdue!</span>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="mb-8 animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Bills Management
                </h1>
                <p className="text-gray-600 text-lg">Manage billing information and payment status with financial insights</p>
      </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={fetchBills}
                  className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowPathIcon className="h-6 w-6 text-gray-600" />
                </button>
        <button
          onClick={openAddForm}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Bill</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-zoomIn group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Bills</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent animate-gradient-flow">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <DocumentTextIcon className="h-8 w-8 text-white animate-bounce-slow" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-violet-200 to-violet-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full animate-shimmer-wave"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-zoomIn animation-delay-200 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Paid Bills</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent animate-gradient-flow">{stats.paid}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="h-8 w-8 text-white animate-bounce-slow animation-delay-200" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-emerald-200 to-emerald-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-shimmer-wave animation-delay-200"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-zoomIn animation-delay-400 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Unpaid Bills</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent animate-gradient-flow">{stats.unpaid}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <ClockIcon className="h-8 w-8 text-white animate-bounce-slow animation-delay-400" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full animate-shimmer-wave animation-delay-400"></div>
                </div>
              </div>
              
              <div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-zoomIn animation-delay-500 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent animate-gradient-flow">${stats.totalAmount}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <BanknotesIcon className="h-8 w-8 text-white animate-bounce-slow animation-delay-500" />
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-purple-200 to-purple-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-shimmer-wave animation-delay-500"></div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="glass-card rounded-2xl p-6 mb-6 animate-slideInRight">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bills by amount, status, or meter reading..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Overdue">Overdue</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                    <option value="status-asc">Status A-Z</option>
                    <option value="status-desc">Status Z-A</option>
                    <option value="overdue-desc">Overdue (Most)</option>
                    <option value="overdue-asc">Overdue (Least)</option>
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
              {selectedBills.length > 0 && (
                <div className="mt-4 p-4 bg-violet-50 rounded-xl border border-violet-200 animate-fadeInUp">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-700 font-medium">
                      {selectedBills.length} bill{selectedBills.length > 1 ? 's' : ''} selected
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
          <div className="glass-card rounded-2xl overflow-hidden animate-fadeInUp">
        {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mt-4 animate-bounce-slow">Loading bills...</p>
                  <p className="text-sm text-gray-500 animate-fadeInUp animation-delay-200">Please wait while we fetch the data</p>
                </div>
              </div>
        ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Bills</p>
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchBills}
                    className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
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
                      {paginatedBills.map((bill, index) => (
                        <div
                          key={bill.BillID || bill._id}
                          className={`glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 border-2 ${
                            selectedBills.includes(bill.BillID || bill._id) 
                              ? 'border-violet-500 bg-violet-50/50' 
                              : 'border-transparent hover:border-white/50'
                          } animate-zoomIn group`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedBills.includes(bill.BillID || bill._id)}
                                onChange={() => handleSelectBill(bill.BillID || bill._id)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <div className="h-12 w-12 bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  ${bill.Amount?.toString().charAt(0) || 'B'}
                                </span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              bill.PaymentStatus === 'Paid' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : bill.PaymentStatus === 'Unpaid'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {bill.PaymentStatus}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">${bill.Amount}</h3>
                              <p className="text-gray-500 text-sm">Bill ID: {index + 1}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{formatDate(bill.BillDate)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <DocumentTextIcon className="h-4 w-4" />
                                <span className="truncate">
                                  {bill.MeterReadingID ? (typeof bill.MeterReadingID === 'object' ? `Reading #${bill.MeterReadingID.MeterReadingID || bill.MeterReadingID._id}` : `Reading #${bill.MeterReadingID}`) : 'N/A'}
                                </span>
                              </div>
                              {bill.overdueDays > 0 && (
                                <div className="flex items-center space-x-2 text-sm text-red-600">
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  <span>{bill.overdueDays} days overdue</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setShowBillDetails(bill)}
                                className="flex items-center space-x-1 text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => openEditForm(bill)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(bill.BillID || bill._id)}
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
                              checked={selectedBills.length === paginatedBills.length && paginatedBills.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bill
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Meter Reading
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overdue
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
              </tr>
            </thead>
                      <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/20">
                        {paginatedBills.map((bill, index) => (
                          <tr
                            key={bill.BillID || bill._id}
                            className={`hover:bg-white/10 transition-all duration-300 ${
                              selectedBills.includes(bill.BillID || bill._id) ? 'bg-violet-50/30' : ''
                            } animate-fadeInUp`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedBills.includes(bill.BillID || bill._id)}
                                onChange={() => handleSelectBill(bill.BillID || bill._id)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                  <span className="text-white font-bold">
                                    ${bill.Amount?.toString().charAt(0) || 'B'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">Bill #{index + 1}</div>
                                  <div className="text-sm text-gray-500">ID: {(bill.BillID || bill._id).toString().slice(-6)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">${bill.Amount}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                bill.PaymentStatus === 'Paid' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : bill.PaymentStatus === 'Unpaid'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                    }`}>
                      {bill.PaymentStatus}
                    </span>
                  </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatDate(bill.BillDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {bill.MeterReadingID ? (typeof bill.MeterReadingID === 'object' ? `Reading #${bill.MeterReadingID.MeterReadingID || bill.MeterReadingID._id}` : `Reading #${bill.MeterReadingID}`) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                    {bill.overdueDays > 0 ? (
                      <span className="text-red-600 font-medium">{bill.overdueDays} days</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setShowBillDetails(bill)}
                                  className="p-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all duration-200"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openEditForm(bill)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(bill.BillID || bill._id)}
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
                        Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
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
                                ? 'bg-violet-500 text-white'
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

          {/* Bill Details Modal */}
          {showBillDetails && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm">
              <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-zoomIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Bill Details</h3>
                  <button
                    onClick={() => setShowBillDetails(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <span className="text-white font-bold text-2xl">
                        ${showBillDetails.Amount?.toString().charAt(0) || 'B'}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">${showBillDetails.Amount}</h4>
                    <p className="text-gray-500">Bill ID: {bills.findIndex(b => (b.BillID || b._id) === (showBillDetails.BillID || showBillDetails._id)) + 1}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Bill Date</p>
                        <p className="text-gray-600">{formatDate(showBillDetails.BillDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Amount</p>
                        <p className="text-gray-600">${showBillDetails.Amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCardIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          showBillDetails.PaymentStatus === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : showBillDetails.PaymentStatus === 'Unpaid'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {showBillDetails.PaymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Meter Reading</p>
                        <p className="text-gray-600">
                          {showBillDetails.MeterReadingID ? (typeof showBillDetails.MeterReadingID === 'object' ? `Reading #${showBillDetails.MeterReadingID.MeterReadingID || showBillDetails.MeterReadingID._id}` : `Reading #${showBillDetails.MeterReadingID}`) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {showBillDetails.overdueDays > 0 && (
                      <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Overdue Days</p>
                          <p className="text-red-600 font-medium">{showBillDetails.overdueDays} days</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowBillDetails(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowBillDetails(null);
                        openEditForm(showBillDetails);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Edit Bill
                    </button>
                    <button
                      onClick={() => {
                        setShowBillDetails(null);
                        handleDelete(showBillDetails.BillID || showBillDetails._id);
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
                className="glass-card w-full max-w-lg mx-4 rounded-2xl p-8 shadow-2xl animate-zoomIn relative focus:outline-none"
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
                aria-modal="true"
                role="dialog"
                aria-labelledby="bill-modal-title"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 id="bill-modal-title" className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {isEdit ? 'Edit Bill' : 'Add New Bill'}
            </h3>
                  <button
                    onClick={closeForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" id="bill-modal-desc">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bill-date">
                        <CalendarIcon className="h-4 w-4 inline mr-2" />
                        Bill Date
                      </label>
                <input
                  id="bill-date"
                  ref={firstInputRef}
                  type="date"
                  name="BillDate"
                  value={formData.BillDate}
                  onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 ${
                          formErrors.BillDate ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        }`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                      {formErrors.BillDate && <div className="text-red-500 text-sm mt-1 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {formErrors.BillDate}
                      </div>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="amount">
                        <CurrencyDollarIcon className="h-4 w-4 inline mr-2" />
                        Amount
                      </label>
                      <input
                        id="amount"
                        type="number"
                        name="Amount"
                        value={formData.Amount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter bill amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="meter-reading">
                      <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                      Meter Reading
                    </label>
                <select
                  id="meter-reading"
                  name="MeterReadingID"
                  value={formData.MeterReadingID}
                  onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.MeterReadingID ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                >
                  <option value="">Select Meter Reading</option>
                      {meterReadings.map((reading, idx) => (
                        <option key={reading._id} value={reading._id}>
                          {`Reading #${reading.MeterReadingID || (idx + 1)} - ${reading.UnitsConsumed} units (${reading.ReadingDate})`}
                    </option>
                  ))}
                </select>
                    {formErrors.MeterReadingID && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {formErrors.MeterReadingID}
                    </div>}
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="payment-status">
                      <CreditCardIcon className="h-4 w-4 inline mr-2" />
                      Payment Status
                    </label>
                <select
                  id="payment-status"
                  name="PaymentStatus"
                  value={formData.PaymentStatus}
                  onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.PaymentStatus ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                </select>
                    {formErrors.PaymentStatus && <div className="text-red-500 text-sm mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {formErrors.PaymentStatus}
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <span>{isEdit ? 'Update Bill' : 'Add Bill'}</span>
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

export default BillsPage; 