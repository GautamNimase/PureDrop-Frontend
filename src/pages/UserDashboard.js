import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UserOverview from '../components/user/UserOverview';
import UserProfile from '../components/user/UserProfile';
import UserConnections from '../components/user/UserConnections';
import UserReadings from '../components/user/UserReadings';
import UserBills from '../components/user/UserBills';
import WaterUsageChart, { total as usageTotal, avg as usageAvg, max as usageMax } from '../components/user/WaterUsageChart';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, CreditCardIcon, LifebuoyIcon, UserPlusIcon, ArrowRightIcon, InboxIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connectionsError, setConnectionsError] = useState(null);
  const [readings, setReadings] = useState([]);
  const [readingsLoading, setReadingsLoading] = useState(true);
  const [readingsError, setReadingsError] = useState(null);
  const [bills, setBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [billsError, setBillsError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id && !user?.UserID) return;
    setProfileLoading(true);
    fetch(`/api/users/${user.id || user.UserID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setProfileLoading(false);
      })
      .catch(err => {
        setProfileError('Failed to load profile');
        setProfileLoading(false);
      });
  }, [user?.id, user?.UserID, token]);

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    setConnectionsLoading(true);
    fetch(`/api/connections?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConnections(data);
        } else {
          setConnections([]);
          setConnectionsError(data.error || 'Failed to load connections');
        }
        setConnectionsLoading(false);
      })
      .catch(err => {
        setConnectionsError('Failed to load connections');
        setConnectionsLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    setReadingsLoading(true);
    fetch(`/api/readings?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setReadings(data);
        setReadingsLoading(false);
      })
      .catch(err => {
        setReadingsError('Failed to load readings');
        setReadingsLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    setBillsLoading(true);
    fetch(`/api/bills?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setBills(data);
        setBillsLoading(false);
      })
      .catch(err => {
        setBillsError('Failed to load bills');
        setBillsLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

  useEffect(() => {
    if (!user?.UserID && !user?.id) return;
    setAlertsLoading(true);
    fetch(`/api/alerts?userId=${user.UserID || user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setAlertsLoading(false);
      })
      .catch(err => {
        setAlertsError('Failed to load alerts');
        setAlertsLoading(false);
      });
  }, [user?.UserID, user?.id, token]);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Spinner SVG
  const Spinner = () => (
    <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 lg:static">
          <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                {profileLoading ? 'Loading...' : profileError ? profileError : `Hello, ${profile?.firstName || profile?.name || user?.firstName || user?.name || 'User'}!`}
              </div>
              <div className="text-sm text-blue-600 font-medium">{today}</div>
              </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <PlusIcon className="h-5 w-5" /> Add Reading
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <CreditCardIcon className="h-5 w-5" /> Pay Bill
              </button>
              <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <LifebuoyIcon className="h-5 w-5" /> Request Support
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-1 sm:px-4 py-4">
          <Routes>
            <Route index element={
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Card wrapper: add hover/active/animation */}
                {[
                  // My Water Usage
                  <div key="usage" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">My Water Usage</div>
                    <WaterUsageChart />
                    <div className="flex flex-col sm:flex-row justify-between mt-4 text-xs sm:text-sm text-gray-600 gap-2">
                      <div>Total: <span className="font-semibold text-blue-700">{usageTotal} L</span></div>
                      <div>Avg/Day: <span className="font-semibold text-blue-700">{usageAvg} L</span></div>
                      <div>Max: <span className="font-semibold text-blue-700">{usageMax} L</span></div>
                    </div>
                  </div>,
                  // My Connections
                  <div key="connections" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">My Connections</div>
                    {connectionsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : connectionsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{connectionsError}</div>
                    ) : connections.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No connections found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {connections.slice(0, 3).map(conn => (
                          <li key={conn.ConnectionID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">Meter: {conn.MeterNumber}</div>
                            <div className="text-xs text-gray-500">Status: {conn.Status}</div>
                            <div className="text-xs text-gray-400">SourceID: {conn.SourceID}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="mt-4 px-4 py-3 sm:py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full text-center justify-center" onClick={() => navigate('/user/connections')}> <UserPlusIcon className="h-5 w-5" /> Request New Connection </button>
                  </div>,
                  // Recent Bills
                  <div key="bills" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Recent Bills</div>
                    {billsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : billsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{billsError}</div>
                    ) : bills.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No bills found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {bills.slice(0, 3).map(bill => (
                          <li key={bill.BillID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">{bill.BillDate}</div>
                            <div className="text-xs text-gray-500">Amount: ₹{bill.Amount}</div>
                            <div className="text-xs text-gray-400">Status: {bill.PaymentStatus}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="mt-4 px-4 py-3 sm:py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-200 w-full text-center justify-center" onClick={() => navigate('/user/bills')}> <ArrowRightIcon className="h-5 w-5" /> View All Bills </button>
                  </div>,
                  // Recent Meter Readings
                  <div key="readings" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Recent Meter Readings</div>
                    {readingsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : readingsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{readingsError}</div>
                    ) : readings.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No readings found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {readings.slice(0, 3).map(reading => (
                          <li key={reading.MeterReadingID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">{reading.ReadingDate}</div>
                            <div className="text-xs text-gray-500">Units: {reading.UnitsConsumed}</div>
                            <div className="text-xs text-gray-400">ConnectionID: {reading.ConnectionID}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="mt-4 px-4 py-3 sm:py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full text-center justify-center" onClick={() => navigate('/user/readings')}> <InboxIcon className="h-5 w-5" /> View All Readings </button>
                  </div>,
                  // Alerts & Notifications
                  <div key="alerts" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Alerts & Notifications</div>
                    {alertsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : alertsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{alertsError}</div>
                    ) : alerts.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No alerts found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {alerts.slice(0, 3).map(alert => (
                          <li key={alert.AlertID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">{alert.Type}</div>
                            <div className="text-xs text-gray-500 whitespace-pre-line break-words">{alert.Message}</div>
                            <div className="text-xs text-gray-400">{alert.Status} • {alert.Timestamp}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>,
                  // Support/Help
                  <div key="support" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Support & Help</div>
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                      <a href="mailto:support@watersystem.com" className="w-full px-4 py-3 sm:py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition text-center flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-purple-300"> <LifebuoyIcon className="h-5 w-5" /> Contact Support </a>
                      <button className="w-full px-4 py-3 sm:py-2 bg-pink-100 text-pink-700 rounded-lg font-medium hover:bg-pink-200 transition text-center flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-pink-200" onClick={() => navigate('/user/complaints')}> <ArrowRightIcon className="h-5 w-5" /> Raise a Complaint </button>
                      <button className="w-full px-4 py-3 sm:py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition text-center flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-blue-200" onClick={() => navigate('/user/faqs')}> <QuestionMarkCircleIcon className="h-5 w-5" /> FAQs </button>
                    </div>
                  </div>
                ].map(card => card)}
              </div>
            } />
            <Route path="dashboard" element={
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {/* Card wrapper: add hover/active/animation */}
                {[
                  // My Water Usage
                  <div key="usage" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">My Water Usage</div>
                    <WaterUsageChart />
                    <div className="flex flex-col sm:flex-row justify-between mt-4 text-xs sm:text-sm text-gray-600 gap-2">
                      <div>Total: <span className="font-semibold text-blue-700">{usageTotal} L</span></div>
                      <div>Avg/Day: <span className="font-semibold text-blue-700">{usageAvg} L</span></div>
                      <div>Max: <span className="font-semibold text-blue-700">{usageMax} L</span></div>
                    </div>
                  </div>,
                  // My Connections
                  <div key="connections" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">My Connections</div>
                    {connectionsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : connectionsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{connectionsError}</div>
                    ) : connections.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No connections found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {connections.slice(0, 3).map(conn => (
                          <li key={conn.ConnectionID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">Meter: {conn.MeterNumber}</div>
                            <div className="text-xs text-gray-500">Status: {conn.Status}</div>
                            <div className="text-xs text-gray-400">SourceID: {conn.SourceID}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="mt-4 px-4 py-3 sm:py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full text-center justify-center" onClick={() => navigate('/user/connections')}> <UserPlusIcon className="h-5 w-5" /> Request New Connection </button>
                  </div>,
                  // Recent Bills
                  <div key="bills" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Recent Bills</div>
                    {billsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : billsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{billsError}</div>
                    ) : bills.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No bills found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {bills.slice(0, 3).map(bill => (
                          <li key={bill.BillID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">{bill.BillDate}</div>
                            <div className="text-xs text-gray-500">Amount: ₹{bill.Amount}</div>
                            <div className="text-xs text-gray-400">Status: {bill.PaymentStatus}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="mt-4 px-4 py-3 sm:py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-200 w-full text-center justify-center" onClick={() => navigate('/user/bills')}> <ArrowRightIcon className="h-5 w-5" /> View All Bills </button>
                  </div>,
                  // Recent Meter Readings
                  <div key="readings" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Recent Meter Readings</div>
                    {readingsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : readingsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{readingsError}</div>
                    ) : readings.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No readings found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {readings.slice(0, 3).map(reading => (
                          <li key={reading.MeterReadingID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">{reading.ReadingDate}</div>
                            <div className="text-xs text-gray-500">Units: {reading.UnitsConsumed}</div>
                            <div className="text-xs text-gray-400">ConnectionID: {reading.ConnectionID}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="mt-4 px-4 py-3 sm:py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full text-center justify-center" onClick={() => navigate('/user/readings')}> <InboxIcon className="h-5 w-5" /> View All Readings </button>
                  </div>,
                  // Alerts & Notifications
                  <div key="alerts" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Alerts & Notifications</div>
                    {alertsLoading ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]"> <Spinner /> </div>
                    ) : alertsError ? (
                      <div className="flex-1 flex items-center justify-center text-red-400 min-h-[48px]">{alertsError}</div>
                    ) : alerts.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 min-h-[48px]">No alerts found.</div>
                    ) : (
                      <ul className="flex-1 divide-y divide-gray-100">
                        {alerts.slice(0, 3).map(alert => (
                          <li key={alert.AlertID} className="py-2 flex flex-col gap-1">
                            <div className="font-medium text-gray-800 truncate">{alert.Type}</div>
                            <div className="text-xs text-gray-500 whitespace-pre-line break-words">{alert.Message}</div>
                            <div className="text-xs text-gray-400">{alert.Status} • {alert.Timestamp}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>,
                  // Support/Help
                  <div key="support" className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] animate-fadeIn">
                    <div className="text-base sm:text-lg font-bold text-blue-700 mb-2">Support & Help</div>
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                      <a href="mailto:support@watersystem.com" className="w-full px-4 py-3 sm:py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition text-center flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-purple-300"> <LifebuoyIcon className="h-5 w-5" /> Contact Support </a>
                      <button className="w-full px-4 py-3 sm:py-2 bg-pink-100 text-pink-700 rounded-lg font-medium hover:bg-pink-200 transition text-center flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-pink-200" onClick={() => navigate('/user/complaints')}> <ArrowRightIcon className="h-5 w-5" /> Raise a Complaint </button>
                      <button className="w-full px-4 py-3 sm:py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition text-center flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-blue-200" onClick={() => navigate('/user/faqs')}> <QuestionMarkCircleIcon className="h-5 w-5" /> FAQs </button>
                    </div>
                  </div>
                ].map(card => card)}
              </div>
            } />
            <Route path="profile" element={<UserProfile />} />
            <Route path="connections" element={<UserConnections />} />
            <Route path="readings" element={<UserReadings />} />
            <Route path="bills" element={<UserBills />} />
            {/* Add other routes as needed */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard; 