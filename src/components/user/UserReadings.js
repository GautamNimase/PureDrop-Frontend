import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const UserReadings = () => {
  const { user, token } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    
    setLoading(true);
    fetch(`/api/readings?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        setReadings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load readings');
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

  const getConsumptionTrend = (current, previous) => {
    const currentValue = parseFloat(current) || 0;
    const previousValue = parseFloat(previous) || 0;
    
    if (!previousValue || previousValue === 0) return 'new';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    if (change > 5) return 'increase';
    if (change < -5) return 'decrease';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increase':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'decrease':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ChartBarIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend) => {
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

  const filteredReadings = readings.filter(reading => {
    if (selectedPeriod === 'all') return true;
    const readingDate = new Date(reading.ReadingDate);
    const now = new Date();
    const diffTime = Math.abs(now - readingDate);
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

  const totalConsumption = filteredReadings.reduce((sum, reading) => sum + (parseFloat(reading.UnitsConsumed) || 0), 0);
  const averageConsumption = filteredReadings.length > 0 ? totalConsumption / filteredReadings.length : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meter Readings</h1>
        <p className="text-gray-600">Track your water consumption and usage patterns</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Readings</p>
              <p className="text-2xl font-bold text-gray-900">{filteredReadings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Consumption</p>
              <p className="text-2xl font-bold text-gray-900">{totalConsumption.toFixed(2)} m³</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average per Reading</p>
              <p className="text-2xl font-bold text-gray-900">{averageConsumption.toFixed(2)} m³</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filter Readings</h3>
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

      {/* Readings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reading History</h3>
        </div>
        
        {filteredReadings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No readings found for the selected period.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReadings.map((reading, index) => {
              const previousReading = index < filteredReadings.length - 1 ? filteredReadings[index + 1] : null;
              const trend = getConsumptionTrend(reading.UnitsConsumed, previousReading?.UnitsConsumed);
              
              return (
                <div key={reading._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ChartBarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Reading #{reading._id}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Connection: {reading.ConnectionID?.MeterNumber || reading.ConnectionID || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTrendColor(trend)}`}>
                        {trend === 'increase' ? 'Increased' : 
                         trend === 'decrease' ? 'Decreased' : 
                         trend === 'stable' ? 'Stable' : 'New'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Reading Date</p>
                      <p className="font-medium text-gray-900">{formatDate(reading.ReadingDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Units Consumed</p>
                      <p className="font-medium text-gray-900">{reading.UnitsConsumed} m³</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recorded At</p>
                      <p className="font-medium text-gray-900">{formatDateTime(reading.CreatedAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReadings; 