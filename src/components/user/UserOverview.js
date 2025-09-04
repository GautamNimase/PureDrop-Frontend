import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const UserOverview = () => {
  const { user } = useAuth();
  const { waterConnections, bills, meterReadings, alerts } = useData();

  // Filter data for current user
  const userConnections = waterConnections.filter(c => c.customerId === user?.customerId);
  const userBills = bills.filter(b => b.customerId === user?.customerId);
  const userReadings = meterReadings.filter(r => r.customerId === user?.customerId);
  const userAlerts = alerts.filter(a => a.customerId === user?.customerId);

  const stats = [
    {
      name: 'Active Connections',
      value: userConnections.filter(c => c.status === 'active').length,
      icon: CogIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Your water connections'
    },
    {
      name: 'Pending Bills',
      value: userBills.filter(b => b.status === 'pending').length,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      description: 'Unpaid bills'
    },
    {
      name: 'Total Readings',
      value: userReadings.length,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      description: 'Meter readings submitted'
    },
    {
      name: 'Active Alerts',
      value: userAlerts.filter(a => a.status === 'active').length,
      icon: ExclamationTriangleIcon,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      description: 'System notifications'
    }
  ];

  const quickActions = [
    {
      name: 'Submit Meter Reading',
      icon: PlusIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Add new reading'
    },
    {
      name: 'View My Bills',
      icon: EyeIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      description: 'Check billing history'
    },
    {
      name: 'Update Profile',
      icon: UserIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Edit personal info'
    }
  ];

  const recentBills = userBills.slice(0, 5);
  const recentReadings = userReadings.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h2>
        <p className="text-gray-600 text-sm sm:text-base">Here's your water management overview</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Recent Bills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bills</h3>
          {recentBills.length > 0 ? (
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">Bill #{bill.id}</p>
                    <p className="text-sm text-gray-500">{bill.date}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">${bill.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                      bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bills found</p>
              <p className="text-sm text-gray-400 mt-1">Your billing history will appear here</p>
            </div>
          )}
        </div>

        {/* Recent Readings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Meter Readings</h3>
          {recentReadings.length > 0 ? (
            <div className="space-y-3">
              {recentReadings.map((reading) => (
                <div key={reading.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">Reading #{reading.id}</p>
                    <p className="text-sm text-gray-500">{reading.date}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">{reading.reading} units</p>
                    <p className="text-xs text-gray-500">Meter: {reading.meterId}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No readings found</p>
              <p className="text-sm text-gray-400 mt-1">Your meter readings will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button 
              key={action.name}
              className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200 group text-left"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-900">{action.name}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Account Status */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Status</h3>
            <p className="text-sm text-gray-600">Your account is active and in good standing</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOverview; 