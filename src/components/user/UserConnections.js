import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  MapPinIcon,
  CogIcon,
  WifiIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const UserConnections = () => {
  const { user, token } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    
    setLoading(true);
    fetch(`/api/connections?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setConnections(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load connections');
        setLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'suspended':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <ExclamationCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Connections</h1>
        <p className="text-gray-600">Manage your water connections and view their status</p>
      </div>

      {connections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center text-gray-500">
            <CogIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No connections found</p>
            <p className="text-sm">You don't have any water connections yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {connections.map((connection) => (
            <div key={connection._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Connection Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CogIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Connection #{connection._id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Meter: {connection.MeterNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(connection.Status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.Status)}`}>
                      {connection.Status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 mb-3">Connection Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Connection Date:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(connection.ConnectionDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Meter Number:</span>
                        <span className="font-medium text-gray-900">
                          {connection.MeterNumber || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-gray-900">
                          {connection.Status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User:</span>
                        <span className="font-medium text-gray-900">
                          {connection.UserID?.Name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">
                          {connection.UserID?.Email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Water Source:</span>
                        <span className="font-medium text-gray-900">
                          {connection.SourceID?.Name || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Status Details */}
                {connection.Status?.toLowerCase() === 'suspended' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Connection Suspended</p>
                        <p className="text-sm text-orange-700 mt-1">
                          This connection has been suspended. Please contact support for assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {connection.Status?.toLowerCase() === 'inactive' && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Connection Inactive</p>
                        <p className="text-sm text-gray-700 mt-1">
                          This connection is currently inactive. Contact support to reactivate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserConnections; 