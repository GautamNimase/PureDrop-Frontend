import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';

const UserBills = () => {
  const { user, token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    
    setLoading(true);
    fetch(`/api/bills?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        setBills(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load bills');
        setLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAmountTrend = (current, previous) => {
    const currentValue = parseFloat(current) || 0;
    const previousValue = parseFloat(previous) || 0;
    
    if (!previousValue || previousValue === 0) return 'new';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    if (change > 5) return 'increase';
    if (change < -5) return 'decrease';
    return 'stable';
  };

  const getPaymentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'unpaid':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <ClockIconSolid className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'unpaid':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'overdue':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAmountTrendIcon = (trend) => {
    switch (trend) {
      case 'increase':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'decrease':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAmountTrendColor = (trend) => {
    switch (trend) {
      case 'increase':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'decrease':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'stable':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const Spinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center text-red-600">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredBills = bills.filter(bill => {
    if (selectedPeriod === 'all') return true;
    const billDate = new Date(bill.BillDate);
    const now = new Date();
    const diffTime = Math.abs(now - billDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (selectedPeriod) {
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case 'quarter':
        return diffDays <= 90;
      default:
        return true;
    }
  });

  const totalAmount = filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
  const paidAmount = filteredBills
    .filter(bill => bill.PaymentStatus?.toLowerCase() === 'paid')
    .reduce((sum, bill) => sum + (parseFloat(bill.Amount) || 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bills</h1>
        <p className="text-gray-600">View and manage your water bills and payments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{filteredBills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">${paidAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">${unpaidAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filter Bills</h3>
          <div className="flex gap-2">
            {['all', 'week', 'month', 'quarter'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Bill History</h3>
        </div>
        
        {filteredBills.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No bills found for the selected period.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBills.map((bill, index) => {
              const previousBill = index < filteredBills.length - 1 ? filteredBills[index + 1] : null;
              const trend = getAmountTrend(bill.Amount, previousBill?.Amount);
              
              return (
                <div key={bill._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Bill #{bill._id}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Meter Reading: {bill.MeterReadingID || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(bill.PaymentStatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(bill.PaymentStatus)}`}>
                        {bill.PaymentStatus || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bill Date</p>
                      <p className="font-medium text-gray-900">{formatDate(bill.BillDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">${bill.Amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900">{bill.PaymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-medium text-gray-900">{formatDate(bill.PaymentDate)}</p>
                    </div>
                  </div>

                  {bill.PaymentStatus?.toLowerCase() === 'overdue' && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Payment Overdue</p>
                          <p className="text-sm text-orange-700 mt-1">
                            This bill is overdue. Please make payment as soon as possible to avoid service interruption.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBills; 