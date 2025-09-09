import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import ModernConnectionsPage from './ModernConnectionsPage';
import ModernBillsPage from './ModernBillsPage';
import ModernReadingsPage from './ModernReadingsPage';
import ModernSourcesPage from './ModernSourcesPage';
import AdminAnalytics from './AdminAnalytics';
import ConnectionsPage from './ConnectionsPage';
import ReadingsPage from './ReadingsPage';
import BillsPage from './BillsPage';
import SourcesPage from './SourcesPage';
import UsersPage from './UsersPage';
import EmployeesPage from './EmployeesPage';
import AlertsPage from './AlertsPage';
import ComplaintsPage from './ComplaintsPage';
import CustomersPage from './CustomersPage';
import QualityPage from './QualityPage';
import AuditPage from './AuditPage';

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/connections" element={<ConnectionsPage />} />
      <Route path="/bills" element={<BillsPage />} />
      <Route path="/readings" element={<ReadingsPage />} />
      <Route path="/sources" element={<SourcesPage />} />
      <Route path="/analytics" element={<AdminAnalytics />} />
      
      {/* Legacy routes for existing pages */}
      <Route path="/legacy/connections" element={<ConnectionsPage />} />
      <Route path="/legacy/readings" element={<ReadingsPage />} />
      <Route path="/legacy/bills" element={<BillsPage />} />
      <Route path="/legacy/sources" element={<SourcesPage />} />
      <Route path="/legacy/users-old" element={<UsersPage />} />
      <Route path="/legacy/employees" element={<EmployeesPage />} />
      <Route path="/legacy/alerts" element={<AlertsPage />} />
      <Route path="/legacy/complaints" element={<ComplaintsPage />} />
      <Route path="/legacy/customers" element={<CustomersPage />} />
      <Route path="/legacy/quality" element={<QualityPage />} />
      <Route path="/legacy/audit" element={<AuditPage />} />
    </Routes>
  );
};

export default AdminRouter;
