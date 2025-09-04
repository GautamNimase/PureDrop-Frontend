import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import UsersPage from '../components/admin/UsersPage';
import EmployeesPage from '../components/admin/EmployeesPage';
import ConnectionsPage from '../components/admin/ConnectionsPage';
import ReadingsPage from '../components/admin/ReadingsPage';
import BillsPage from '../components/admin/BillsPage';
import SourcesPage from '../components/admin/SourcesPage';
import AuditPage from '../components/admin/AuditPage';
import AlertsPage from '../components/admin/AlertsPage';
import ComplaintsPage from '../components/admin/ComplaintsPage';

const AdminDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <header className="bg-white shadow-sm border-b border-gray-200 lg:static">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="lg:hidden">
                {/* Spacer for mobile menu button */}
                <div className="w-10"></div>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center lg:text-left flex-1">
                Admin Dashboard
              </h1>
              <div className="lg:hidden">
                {/* Spacer for balance */}
                <div className="w-10"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/readings" element={<ReadingsPage />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 