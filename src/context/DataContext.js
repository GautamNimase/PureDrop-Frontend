import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Mock data state
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [waterConnections, setWaterConnections] = useState([]);
  const [meterReadings, setMeterReadings] = useState([]);
  const [bills, setBills] = useState([]);
  const [waterSources, setWaterSources] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  // User management
  const [users, setUsers] = useState([]);

  // CRUD operations for customers
  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now() };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    ));
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // CRUD operations for employees
  const addEmployee = (employee) => {
    const newEmployee = { ...employee, id: Date.now() };
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  };

  const updateEmployee = (id, updates) => {
    setEmployees(prev => prev.map(employee => 
      employee.id === id ? { ...employee, ...updates } : employee
    ));
  };

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(employee => employee.id !== id));
  };

  // CRUD operations for water connections
  const addWaterConnection = (connection) => {
    const newConnection = { ...connection, id: Date.now() };
    setWaterConnections(prev => [...prev, newConnection]);
    return newConnection;
  };

  const updateWaterConnection = (id, updates) => {
    setWaterConnections(prev => prev.map(connection => 
      connection.id === id ? { ...connection, ...updates } : connection
    ));
  };

  const deleteWaterConnection = (id) => {
    setWaterConnections(prev => prev.filter(connection => connection.id !== id));
  };

  // CRUD operations for meter readings
  const addMeterReading = (reading) => {
    const newReading = { ...reading, id: Date.now() };
    setMeterReadings(prev => [...prev, newReading]);
    return newReading;
  };

  const updateMeterReading = (id, updates) => {
    setMeterReadings(prev => prev.map(reading => 
      reading.id === id ? { ...reading, ...updates } : reading
    ));
  };

  const deleteMeterReading = (id) => {
    setMeterReadings(prev => prev.filter(reading => reading.id !== id));
  };

  // CRUD operations for bills
  const addBill = (bill) => {
    const newBill = { ...bill, id: Date.now() };
    setBills(prev => [...prev, newBill]);
    return newBill;
  };

  const updateBill = (id, updates) => {
    setBills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, ...updates } : bill
    ));
  };

  const deleteBill = (id) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
  };

  // CRUD operations for water sources
  const addWaterSource = (source) => {
    const newSource = { ...source, id: Date.now() };
    setWaterSources(prev => [...prev, newSource]);
    return newSource;
  };

  const updateWaterSource = (id, updates) => {
    setWaterSources(prev => prev.map(source => 
      source.id === id ? { ...source, ...updates } : source
    ));
  };

  const deleteWaterSource = (id) => {
    setWaterSources(prev => prev.filter(source => source.id !== id));
  };

  // Add alert
  const addAlert = (alert) => {
    const newAlert = { ...alert, id: Date.now(), timestamp: new Date().toISOString() };
    setAlerts(prev => [...prev, newAlert]);
  };

  // Add audit log
  const addAuditLog = (log) => {
    const newLog = { ...log, id: Date.now(), timestamp: new Date().toISOString() };
    setAuditLogs(prev => [...prev, newLog]);
  };

  const addUser = (user) => {
    const newUser = { ...user, id: Date.now() };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };
  const getUserByEmail = (email) => users.find(u => u.email === email);

  const value = {
    // Data
    customers,
    employees,
    waterConnections,
    meterReadings,
    bills,
    waterSources,
    auditLogs,
    alerts,
    users,
    addUser,
    getUserByEmail,
    
    // Customer operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Employee operations
    addEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Water connection operations
    addWaterConnection,
    updateWaterConnection,
    deleteWaterConnection,
    
    // Meter reading operations
    addMeterReading,
    updateMeterReading,
    deleteMeterReading,
    
    // Bill operations
    addBill,
    updateBill,
    deleteBill,
    
    // Water source operations
    addWaterSource,
    updateWaterSource,
    deleteWaterSource,
    
    // Alert and audit operations
    addAlert,
    addAuditLog
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 