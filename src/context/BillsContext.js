import React, { createContext, useContext, useState, useCallback } from 'react';

const BillsContext = createContext();

export const useBills = () => {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBills must be used within a BillsProvider');
  }
  return context;
};

export const BillsProvider = ({ children }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add a new bill (used when generating bills from readings)
  const addBill = useCallback((newBill) => {
    setBills(prev => [...prev, newBill]);
  }, []);

  // Update an existing bill
  const updateBill = useCallback((billId, updatedBill) => {
    setBills(prev => prev.map(bill => 
      bill._id === billId ? { ...bill, ...updatedBill } : bill
    ));
  }, []);

  // Delete a bill
  const deleteBill = useCallback((billId) => {
    setBills(prev => prev.filter(bill => bill._id !== billId));
  }, []);

  // Set bills (used for initial loading)
  const setBillsData = useCallback((billsData) => {
    setBills(billsData);
  }, []);

  const value = {
    bills,
    loading,
    setLoading,
    addBill,
    updateBill,
    deleteBill,
    setBillsData
  };

  return (
    <BillsContext.Provider value={value}>
      {children}
    </BillsContext.Provider>
  );
};
