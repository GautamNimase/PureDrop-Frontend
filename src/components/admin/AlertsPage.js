import React, { useState, useRef, useEffect } from 'react';

const initialFormState = { Type: '', Message: '', Status: 'Active' };

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [editingStatusValue, setEditingStatusValue] = useState('');

  // Fetch alerts from backend
  const fetchAlerts = () => {
    setLoading(true);
    fetch('/api/alerts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch alerts');
        return res.json();
      })
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

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
    if (!modal) return;
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

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (alert) => {
    setFormData({ Type: alert.Type, Message: alert.Message, Status: alert.Status });
    setIsEdit(true);
    setEditId(alert.AlertID);
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
    if (!formData.Type.trim()) errors.Type = 'Type is required';
    if (!formData.Message.trim()) errors.Message = 'Message is required';
    if (!formData.Status) errors.Status = 'Status is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    if (isEdit) {
      // Edit alert via API
      fetch(`/api/alerts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update alert');
          return res.json();
        })
        .then(updated => {
          setAlerts(prev => prev.map(alert => alert.AlertID === editId ? updated : alert));
          setSuccessMsg('Alert updated successfully!');
          closeForm();
          setTimeout(() => setSuccessMsg(''), 3000);
        })
        .catch(err => {
          setFormErrors({ api: err.message });
        })
        .finally(() => setSubmitting(false));
    } else {
      // Add alert via API
      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add alert');
          return res.json();
        })
        .then(added => {
          setAlerts(prev => [...prev, added]);
          setSuccessMsg('Alert added successfully!');
          closeForm();
          setTimeout(() => setSuccessMsg(''), 3000);
        })
        .catch(err => {
          setFormErrors({ api: err.message });
        })
        .finally(() => setSubmitting(false));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete alert');
      setAlerts(prev => prev.filter(a => a.AlertID !== id));
      setSuccessMsg('Alert deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.Type.toLowerCase().includes(search.toLowerCase()) ||
    alert.Message.toLowerCase().includes(search.toLowerCase()) ||
    alert.Status.toLowerCase().includes(search.toLowerCase()) ||
    alert.Timestamp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Alerts</h2>
        <p className="text-gray-600">View and manage system alerts and notifications</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add Alert
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by type, message, status, or date..."
          className="w-full sm:w-64 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all mt-4"
          aria-label="Search alerts"
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading alerts...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">AlertID</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-4">No alerts found.</td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr key={alert.AlertID}>
                    <td className="border px-4 py-2">{alert.AlertID}</td>
                    <td className="border px-4 py-2">{alert.Type}</td>
                    <td className="border px-4 py-2">{alert.Message}</td>
                    <td className="border px-4 py-2">
                      {editingStatusId === alert.AlertID ? (
                        <select
                          value={editingStatusValue}
                          onChange={e => setEditingStatusValue(e.target.value)}
                          className="border px-2 py-1 rounded"
                        >
                          <option value="Active">Active</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.Status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {alert.Status}
                        </span>
                      )}
                    </td>
                    <td className="border px-4 py-2">{alert.Timestamp}</td>
                    <td className="border px-4 py-2">
                      {editingStatusId === alert.AlertID ? (
                        <>
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
                            onClick={async () => {
                              // Save status update
                              const updated = { ...alert, Status: editingStatusValue };
                              const res = await fetch(`/api/alerts/${alert.AlertID}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updated),
                              });
                              if (res.ok) {
                                setAlerts(prev => prev.map(a => a.AlertID === alert.AlertID ? { ...a, Status: editingStatusValue } : a));
                                setEditingStatusId(null);
                                setSuccessMsg('Alert status updated!');
                                setTimeout(() => setSuccessMsg(''), 3000);
                              }
                            }}
                          >Save</button>
                          <button
                            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            onClick={() => setEditingStatusId(null)}
                          >Cancel</button>
                        </>
                      ) : (
                        <button
                          className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                          onClick={() => {
                            setEditingStatusId(alert.AlertID);
                            setEditingStatusValue(alert.Status);
                          }}
                        >Update</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
          aria-labelledby="alert-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-lg shadow-lg p-4 sm:p-8 flex flex-col justify-center animate-fadein-scale relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="alert-modal-desc"
          >
            <h3 id="alert-modal-title" className="text-xl font-bold mb-4 text-center text-blue-700">{isEdit ? 'Edit Alert' : 'Add Alert'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="alert-modal-desc">
              {formErrors.api && <div className="text-red-500 text-sm mb-2">{formErrors.api}</div>}
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="type">Type</label>
                <input
                  id="type"
                  ref={firstInputRef}
                  type="text"
                  name="Type"
                  value={formData.Type}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Type ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                />
                {formErrors.Type && <div className="text-red-500 text-sm mt-1">{formErrors.Type}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="Message"
                  value={formData.Message}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Message ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  rows="3"
                />
                {formErrors.Message && <div className="text-red-500 text-sm mt-1">{formErrors.Message}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="status">Status</label>
                <select
                  id="status"
                  name="Status"
                  value={formData.Status}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Status ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Resolved">Resolved</option>
                </select>
                {formErrors.Status && <div className="text-red-500 text-sm mt-1">{formErrors.Status}</div>}
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
                  disabled={submitting}
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

export default AlertsPage; 