import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserLayout from '../components/user/UserLayout';
import UserOverview from '../components/user/UserOverview';
import UserProfile from '../components/user/UserProfile';
import UserBills from '../components/user/UserBills';
import UserConnections from '../components/user/UserConnections';
import UserReadings from '../components/user/UserReadings';
import WaterUsageChart from '../components/user/WaterUsageChart';
import { HeaderProvider } from '../context/HeaderContext';

const UserDashboard = () => {
  return (
    <HeaderProvider>
      <UserLayout>
        <Routes>
          <Route path="/" element={<UserOverview />} />
          <Route path="/overview" element={<UserOverview />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/bills" element={<UserBills />} />
          <Route path="/connections" element={<UserConnections />} />
          <Route path="/readings" element={<UserReadings />} />
          <Route path="/usage" element={<WaterUsageChart />} />
        </Routes>
      </UserLayout>
    </HeaderProvider>
  );
};

export default UserDashboard;
