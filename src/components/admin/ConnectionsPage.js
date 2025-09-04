import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const initialFormState = {
  UserID: '',
  ConnectionDate: '',
  MeterNumber: '',
  Status: '',
  SourceID: '',
};

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [users, setUsers] = useState([]);
  const [waterSources, setWaterSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [maxConnectionsWarning, setMaxConnectionsWarning] = useState(false);
  const [customerIdError, setCustomerIdError] = useState("");
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch connections from backend
  const fetchConnections = () => {
    setLoading(true);
    fetch('/api/connections')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch connections');
        return res.json();
      })
      .then((data) => {
        setConnections(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Fetch users for lookup
  const fetchUsers = () => {
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  };

  // Fetch water sources for dropdown
  const fetchWaterSources = () => {
    fetch('/api/water-sources')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch water sources');
        return res.json();
      })
      .then((data) => setWaterSources(data))
      .catch(() => setWaterSources([]));
  };

  useEffect(() => {
    fetchConnections();
    fetchUsers();
    fetchWaterSources();
  }, []);

  // Auto-open add modal if navigated with action=add
  useEffect(() => {
    if (
      location.state &&
      location.state.action === 'add' &&
      !showForm
    ) {
      openAddForm();
      // Clear the state so it doesn't reopen on every navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, showForm, navigate, location.pathname]);

  useEffect(() => {
    if (showForm && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeForm(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showForm]);

  // Focus trap for modal
  useEffect(() => {
    if (!showForm) return;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = modalRef.current;
    const firstEl = modal.querySelectorAll(focusableElements)[0];
    const focusEls = modal.querySelectorAll(focusableElements);
    const lastEl = focusEls[focusEls.length - 1];
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    modal.addEventListener('keydown', trap);
    return () => modal.removeEventListener('keydown', trap);
  }, [showForm]);

  // Check max 2 connections per user
  useEffect(() => {
    if (!showForm || !formData.UserID) {
      setMaxConnectionsWarning(false);
      setCustomerIdError("");
      return;
    }
    const count = connections.filter(c => String(c.UserID) === String(formData.UserID)).length;
    setMaxConnectionsWarning(!isEdit && count >= 2);
    // UserID validation
    if (!users.some(u => String(u.UserID) === String(formData.UserID))) {
      setCustomerIdError('UserID is not present');
    } else {
      setCustomerIdError('');
    }
  }, [formData.UserID, connections, showForm, isEdit, users]);

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (connection) => {
    setFormData({
      UserID: connection.UserID,
      ConnectionDate: connection.ConnectionDate,
      MeterNumber: connection.MeterNumber,
      Status: connection.Status,
      SourceID: connection.SourceID || '',
    });
    setIsEdit(true);
    setEditId(connection.ConnectionID);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setFormErrors({});
    setMaxConnectionsWarning(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.UserID) errors.UserID = 'User is required';
    if (!formData.ConnectionDate) errors.ConnectionDate = 'Connection Date is required';
    if (!formData.MeterNumber.trim()) errors.MeterNumber = 'Meter Number is required';
    if (!formData.Status.trim()) errors.Status = 'Status is required';
    if (!formData.SourceID) errors.SourceID = 'Water Source is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0 || maxConnectionsWarning) return;
    setSubmitting(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/connections/${editId}` : '/api/connections';

      // Format ConnectionDate to YYYY-MM-DD if needed
      let formattedDate = formData.ConnectionDate;
      if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      const requestData = {
        ...formData,
        ConnectionDate: formattedDate,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!res.ok) throw new Error('Failed to save connection');
      closeForm();
      fetchConnections();
      setSuccessMsg(isEdit ? 'Connection updated successfully!' : 'Connection added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    try {
      const res = await fetch(`/api/connections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete connection');
      fetchConnections();
      setSuccessMsg('Connection deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper to get user name by ID
  const getUserName = (id) => {
    const user = users.find(u => String(u.UserID) === String(id));
    return user ? user.Name : id;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Water Connections Management</h2>
        <p className="text-gray-600">Manage water connections and meter information</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add Connection
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading connections...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">ConnectionID</th>
                <th className="px-4 py-2">ConnectionDate</th>
                <th className="px-4 py-2">MeterNumber</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">UserID</th>
                <th className="px-4 py-2">SourceID</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((connection) => (
                <tr key={connection.ConnectionID}>
                  <td className="border px-4 py-2">{connection.ConnectionID}</td>
                  <td className="border px-4 py-2">{connection.ConnectionDate}</td>
                  <td className="border px-4 py-2">{connection.MeterNumber}</td>
                  <td className="border px-4 py-2">{connection.Status}</td>
                  <td className="border px-4 py-2">{connection.UserID}</td>
                  <td className="border px-4 py-2">{connection.SourceID}</td>
                  <td className="border px-4 py-2 flex gap-2 justify-center items-center">
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-indigo-400 text-white rounded-full shadow-md border border-indigo-300 hover:bg-indigo-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-150"
                      onClick={() => openEditForm(connection)}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2" /></svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-rose-400 text-white rounded-full shadow-md border border-rose-300 hover:bg-rose-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-150"
                      onClick={() => handleDelete(connection.ConnectionID)}
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal Form for Add/Edit */}
      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-blue-100/80 via-white/80 to-blue-200/80"
          onClick={closeForm}
          aria-modal="true"
          role="dialog"
          aria-labelledby="connection-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-lg shadow-lg p-4 sm:p-8 flex flex-col justify-center animate-fadein-scale relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="connection-modal-desc"
          >
            <h3 id="connection-modal-title" className="text-xl font-bold mb-4 text-center text-blue-700">{isEdit ? 'Edit Connection' : 'Add Connection'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="connection-modal-desc">
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="connection-user-id">UserID</label>
                <input
                  id="connection-user-id"
                  ref={firstInputRef}
                  type="number"
                  name="UserID"
                  value={formData.UserID}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.UserID || customerIdError ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  min="1"
                  disabled={isEdit}
                />
                {formErrors.UserID && <div className="text-red-500 text-sm mt-1">{formErrors.UserID}</div>}
                {customerIdError && <div className="text-red-500 text-sm mt-1">{customerIdError}</div>}
                {maxConnectionsWarning && (
                  <div className="text-red-600 text-sm mt-1">This user already has 2 connections. Cannot add more.</div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="connection-date">Connection Date</label>
                <input
                  id="connection-date"
                  type="date"
                  name="ConnectionDate"
                  value={formData.ConnectionDate}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.ConnectionDate ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.ConnectionDate && <div className="text-red-500 text-sm mt-1">{formErrors.ConnectionDate}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="connection-meter-number">Meter Number</label>
                <input
                  id="connection-meter-number"
                  type="text"
                  name="MeterNumber"
                  value={formData.MeterNumber}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.MeterNumber ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.MeterNumber && <div className="text-red-500 text-sm mt-1">{formErrors.MeterNumber}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="connection-status">Status</label>
                <select
                  id="connection-status"
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Status ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formErrors.Status && <div className="text-red-500 text-sm mt-1">{formErrors.Status}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="connection-source-id">Water Source</label>
                <select
                  id="connection-source-id"
                  name="SourceID"
                  value={formData.SourceID}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.SourceID ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Water Source</option>
                  {waterSources.map((source) => (
                    <option key={source.SourceID} value={source.SourceID}>
                      {`${source.Name} (${source.Type})`}
                    </option>
                  ))}
                </select>
                {formErrors.SourceID && <div className="text-red-500 text-sm mt-1">{formErrors.SourceID}</div>}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 w-full sm:w-auto transition-colors duration-200"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto transition-colors duration-200 shadow-md"
                  disabled={submitting || maxConnectionsWarning || !!customerIdError}
                >
                  {submitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage; 