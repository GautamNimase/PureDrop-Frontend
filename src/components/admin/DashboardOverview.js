import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  EnvelopeIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

const DashboardOverview = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);
  const navigate = useNavigate();

  // Fetch summary
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/summary')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch summary stats');
        return res.json();
      })
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fetch recent activity (audit logs)
  useEffect(() => {
    setActivityLoading(true);
    setActivityError(null);
    fetch('/api/audit')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch activity');
        return res.json();
      })
      .then(data => {
        // Sort by timestamp descending, take latest 8
        const sorted = [...data].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        setActivity(sorted.slice(0, 8));
        setActivityLoading(false);
      })
      .catch(err => {
        setActivityError(err.message);
        setActivityLoading(false);
      });
  }, []);

  const stats = summary ? [
    {
      name: 'Total Users',
      value: summary.totalUsers,
      icon: UsersIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Registered users'
    },
    {
      name: 'Total Employees',
      value: summary.totalEmployees,
      icon: UserGroupIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      description: 'System employees'
    },
    {
      name: 'Active Connections',
      value: summary.activeConnections,
      icon: CogIcon,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: 'Active water connections'
    },
    {
      name: 'Pending Bills',
      value: summary.pendingBills,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      description: 'Unpaid bills'
    },
    {
      name: 'Total Readings',
      value: summary.totalReadings,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      description: 'Meter readings recorded'
    },
    {
      name: 'Water Sources',
      value: summary.totalSources,
      icon: BeakerIcon,
      color: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      description: 'Available water sources'
    },
    {
      name: 'Active Alerts',
      value: summary.activeAlerts,
      icon: ExclamationTriangleIcon,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      description: 'System alerts'
    },
    {
      name: 'Active Complaints',
      value: summary.activeComplaints,
      icon: ExclamationTriangleIcon,
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      description: 'Open or in-progress complaints'
    }
  ] : [];

  const quickActions = [
    {
      name: 'Add New User',
      icon: UsersIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Register a new user',
      onClick: () => navigate('/admin/users', { state: { action: 'add' } })
    },
    {
      name: 'Create Water Connection',
      icon: CogIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Set up new connection',
      onClick: () => navigate('/admin/connections', { state: { action: 'add' } })
    },
    {
      name: 'Generate Bill',
      icon: DocumentTextIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Create billing statement',
      onClick: () => navigate('/admin/bills', { state: { action: 'add' } })
    },
    {
      name: 'Update Complaint',
      icon: ExclamationTriangleIcon,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      description: 'Edit a complaint',
      onClick: () => navigate('/admin/complaints', { state: { action: 'edit' } })
    },
    {
      name: 'View Alerts',
      icon: ExclamationTriangleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      description: 'Check system alerts',
      onClick: () => navigate('/admin/alerts')
    }
  ];

  // Helper for relative time
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  // Helper for activity icon, color, and entity
  function getActivityMeta(log) {
    // Support both 'action' and 'Action' (backend sends 'action', frontend expects 'Action')
    const actionRaw = log.action || log.Action || '';
    const action = typeof actionRaw === 'string' ? actionRaw.toLowerCase() : '';
    let icon = PlusCircleIcon;
    let color = 'bg-green-500';
    let entity = '';
    if (action.includes('create')) {
      icon = PlusCircleIcon;
      color = 'bg-green-500';
    } else if (action.includes('update')) {
      icon = PencilSquareIcon;
      color = 'bg-blue-500';
    } else if (action.includes('delete')) {
      icon = TrashIcon;
      color = 'bg-red-500';
    } else if (action.includes('alert')) {
      icon = BellAlertIcon;
      color = 'bg-yellow-500';
    } else if (action.includes('complaint')) {
      icon = EnvelopeIcon;
      color = 'bg-pink-500';
    }
    // Entity badge
    if (action.includes('customer')) entity = 'Customer';
    else if (action.includes('employee')) entity = 'Employee';
    else if (action.includes('connection')) entity = 'Connection';
    else if (action.includes('bill')) entity = 'Bill';
    else if (action.includes('reading')) entity = 'Reading';
    else if (action.includes('source')) entity = 'Source';
    else if (action.includes('alert')) entity = 'Alert';
    else if (action.includes('complaint')) entity = 'Complaint';
    return { icon, color, entity };
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">System Overview</h2>
        <p className="text-gray-600 text-sm sm:text-base">Welcome to the Water Management System Dashboard</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {loading && (
          <div className="col-span-full text-center text-gray-500 py-8">Loading summary...</div>
        )}
        {error && (
          <div className="col-span-full text-center text-red-500 py-8">{error}</div>
        )}
        {!loading && !error && stats.map((stat) => (
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

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button 
                key={action.name}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                onClick={action.onClick}
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activityLoading ? (
              <div className="text-gray-500 text-center py-4">Loading activity...</div>
            ) : activityError ? (
              <div className="text-red-500 text-center py-4">{activityError}</div>
            ) : activity.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No recent activity.</div>
            ) : (
              activity.map((log, idx) => (
                <div key={log._id || log.LogID || idx} className="flex items-center">
                  {(() => {
                    const { icon: Icon, color } = getActivityMeta(log);
                    return (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${color} bg-opacity-90`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    );
                  })()}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{log.action || log.Action || 'Unknown Action'} <span className="text-gray-500">{log.details || log.Details || ''}</span></p>
                    <p className="text-xs text-gray-500">{timeAgo(log.timestamp || log.Timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">System Status</h3>
            <p className="text-sm text-gray-600">All systems operational</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 