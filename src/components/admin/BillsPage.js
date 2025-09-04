import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const initialFormState = {
  BillDate: '',
  Amount: '',
  PaymentStatus: '',
  MeterReadingID: '',
};

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [meterReadings, setMeterReadings] = useState([]);
  const [overdueWarning, setOverdueWarning] = useState(false);
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch bills from backend
  const fetchBills = () => {
    setLoading(true);
    fetch('/api/bills')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch bills');
        return res.json();
      })
      .then((data) => {
        setBills(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Fetch meter readings for dropdown
  const fetchMeterReadings = () => {
    fetch('/api/readings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch meter readings');
        return res.json();
      })
      .then((data) => setMeterReadings(data))
      .catch(() => setMeterReadings([]));
  };

  useEffect(() => {
    fetchBills();
    fetchMeterReadings();
  }, []);

  useEffect(() => {
    if (showForm && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeForm();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (bill) => {
    setFormData({
      BillDate: bill.BillDate,
      Amount: bill.Amount,
      PaymentStatus: bill.PaymentStatus,
      MeterReadingID: bill.MeterReadingID || '',
    });
    setIsEdit(true);
    setEditId(bill.BillID);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.BillDate) errors.BillDate = 'Bill Date is required';
    if (!formData.PaymentStatus.trim()) errors.PaymentStatus = 'Payment Status is required';
    if (!formData.MeterReadingID) errors.MeterReadingID = 'Meter Reading is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/bills/${editId}` : '/api/bills';

      // Format BillDate to YYYY-MM-DD if needed
      let formattedDate = formData.BillDate;
      if (/^\d{2}-\d{2}-\d{4}$/.test(formData.BillDate)) {
        const [day, month, year] = formData.BillDate.split('-');
        formattedDate = `${year}-${month}-${day}`;
      }

      const requestData = {
        BillDate: formattedDate,
        PaymentStatus: formData.PaymentStatus,
        MeterReadingID: formData.MeterReadingID,
        Amount: formData.Amount !== undefined && formData.Amount !== '' ? Number(formData.Amount) : 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save bill');
      }

      closeForm();
      fetchBills();
      setSuccessMsg(isEdit ? 'Bill updated successfully!' : 'Bill added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete bill');
      fetchBills();
      setSuccessMsg('Bill deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bills Management</h2>
        <p className="text-gray-600">Manage billing information and payment status</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add Bill
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
        {overdueWarning && (
          <div className="mt-2 text-orange-600 font-semibold">Warning: your bill is overdue</div>
        )}
        </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading bills...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Bill ID</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Meter Reading</th>
                <th className="text-left py-2">Overdue Days</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.BillID} className="border-b hover:bg-gray-50">
                  <td className="py-2">{bill.BillID}</td>
                  <td className="py-2">{bill.BillDate}</td>
                  <td className="py-2">${bill.Amount}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bill.PaymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      bill.PaymentStatus === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bill.PaymentStatus}
                    </span>
                  </td>
                  <td className="py-2">{bill.MeterReadingID}</td>
                  <td className="py-2">
                    {bill.overdueDays > 0 ? (
                      <span className="text-red-600 font-medium">{bill.overdueDays} days</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => openEditForm(bill)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bill.BillID)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {isEdit ? 'Edit Bill' : 'Add New Bill'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="bill-date">Bill Date</label>
                <input
                  id="bill-date"
                  ref={firstInputRef}
                  type="date"
                  name="BillDate"
                  value={formData.BillDate}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.BillDate ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.BillDate && <div className="text-red-500 text-sm mt-1">{formErrors.BillDate}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="meter-reading">Meter Reading</label>
                <select
                  id="meter-reading"
                  name="MeterReadingID"
                  value={formData.MeterReadingID}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.MeterReadingID ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                >
                  <option value="">Select Meter Reading</option>
                  {meterReadings.map((reading) => (
                    <option key={reading.MeterReadingID} value={reading.MeterReadingID}>
                      Reading #{reading.MeterReadingID} - {reading.UnitsConsumed} units ({reading.ReadingDate})
                    </option>
                  ))}
                </select>
                {formErrors.MeterReadingID && <div className="text-red-500 text-sm mt-1">{formErrors.MeterReadingID}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="payment-status">Payment Status</label>
                <select
                  id="payment-status"
                  name="PaymentStatus"
                  value={formData.PaymentStatus}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.PaymentStatus ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                </select>
                {formErrors.PaymentStatus && <div className="text-red-500 text-sm mt-1">{formErrors.PaymentStatus}</div>}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage; 