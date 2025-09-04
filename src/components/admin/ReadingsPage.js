import React, { useState, useEffect, useRef } from 'react';

const initialFormState = {
  ReadingDate: '',
  UnitsConsumed: '',
  ConnectionID: '',
};

const ReadingsPage = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);
  const [highConsumptionWarning, setHighConsumptionWarning] = useState(false);
  const [connections, setConnections] = useState([]);
  const [connectionIdError, setConnectionIdError] = useState("");

  // Fetch readings from backend
  const fetchReadings = () => {
    setLoading(true);
    fetch('/api/readings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch readings');
        return res.json();
      })
      .then((data) => {
        setReadings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Fetch connections for validation
  const fetchConnections = () => {
    fetch('/api/connections')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch connections');
        return res.json();
      })
      .then((data) => setConnections(data))
      .catch(() => setConnections([]));
  };

  useEffect(() => {
    fetchReadings();
    fetchConnections();
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

  useEffect(() => {
    if (!showForm) return;
    // ConnectionID validation
    if (formData.ConnectionID && !connections.some(c => String(c.ConnectionID) === String(formData.ConnectionID))) {
      setConnectionIdError('ConnectionID is not present');
    } else {
      setConnectionIdError('');
    }
  }, [formData.UnitsConsumed, formData.ConnectionID, showForm, connections]);

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (reading) => {
    setFormData({
      ReadingDate: reading.ReadingDate,
      UnitsConsumed: reading.UnitsConsumed,
      ConnectionID: reading.ConnectionID,
    });
    setIsEdit(true);
    setEditId(reading.MeterReadingID);
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
    if (!formData.ReadingDate) errors.ReadingDate = 'Reading Date is required';
    if (!formData.UnitsConsumed || isNaN(formData.UnitsConsumed) || Number(formData.UnitsConsumed) < 0) errors.UnitsConsumed = 'Units Consumed must be a non-negative number';
    if (!formData.ConnectionID) errors.ConnectionID = 'Connection ID is required';
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
      const url = isEdit ? `/api/readings/${editId}` : '/api/readings';

      // Format ReadingDate to YYYY-MM-DD if needed
      let formattedDate = formData.ReadingDate;
      if (formattedDate && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      const requestData = {
        ...formData,
        ReadingDate: formattedDate,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!res.ok) throw new Error('Failed to save reading');
      // Show warning after submit if high consumption
      const units = Number(formData.UnitsConsumed);
      setHighConsumptionWarning(!isNaN(units) && units > 100);
      // Send alert if high consumption
      if (!isNaN(units) && units > 100) {
        await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Type: 'High Consumption',
            Message: `High consumption detected: ${units} units for ConnectionID ${formData.ConnectionID}`,
            Timestamp: new Date().toISOString(),
            Status: 'Active'
          })
        });
      }
      closeForm();
      fetchReadings();
      setSuccessMsg(isEdit ? 'Reading updated successfully!' : 'Reading added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;
    try {
      const res = await fetch(`/api/readings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete reading');
      fetchReadings();
      setSuccessMsg('Reading deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Meter Readings Management</h2>
        <p className="text-gray-600">Manage meter readings and consumption data</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add Reading
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
        {highConsumptionWarning && (
          <div className="mt-2 text-orange-600 font-semibold">Warning: High consumption detected!</div>
        )}
        </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading readings...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">MeterReadingID</th>
                <th className="px-4 py-2">ReadingDate</th>
                <th className="px-4 py-2">UnitsConsumed</th>
                <th className="px-4 py-2">ConnectionID</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => (
                <tr key={reading.MeterReadingID}>
                  <td className="border px-4 py-2">{reading.MeterReadingID}</td>
                  <td className="border px-4 py-2">{reading.ReadingDate}</td>
                  <td className="border px-4 py-2">{reading.UnitsConsumed}</td>
                  <td className="border px-4 py-2">{reading.ConnectionID}</td>
                  <td className="border px-4 py-2 flex gap-2 justify-center items-center">
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-indigo-400 text-white rounded-full shadow-md border border-indigo-300 hover:bg-indigo-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-150"
                      onClick={() => openEditForm(reading)}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2" /></svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-rose-400 text-white rounded-full shadow-md border border-rose-300 hover:bg-rose-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-150"
                      onClick={() => handleDelete(reading.MeterReadingID)}
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
          aria-labelledby="reading-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-lg shadow-lg p-4 sm:p-8 flex flex-col justify-center animate-fadein-scale relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="reading-modal-desc"
          >
            <h3 id="reading-modal-title" className="text-xl font-bold mb-4 text-center text-blue-700">{isEdit ? 'Edit Reading' : 'Add Reading'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="reading-modal-desc">
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="reading-date">Reading Date</label>
                <input
                  id="reading-date"
                  ref={firstInputRef}
                  type="date"
                  name="ReadingDate"
                  value={formData.ReadingDate}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.ReadingDate ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.ReadingDate && <div className="text-red-500 text-sm mt-1">{formErrors.ReadingDate}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="units-consumed">Units Consumed</label>
                <input
                  id="units-consumed"
                  type="number"
                  name="UnitsConsumed"
                  value={formData.UnitsConsumed}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.UnitsConsumed || highConsumptionWarning ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  min="0"
                />
                {formErrors.UnitsConsumed && <div className="text-red-500 text-sm mt-1">{formErrors.UnitsConsumed}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="connection-id">Connection ID</label>
                <input
                  id="connection-id"
                  type="number"
                  name="ConnectionID"
                  value={formData.ConnectionID}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.ConnectionID || connectionIdError ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  min="1"
                />
                {formErrors.ConnectionID && <div className="text-red-500 text-sm mt-1">{formErrors.ConnectionID}</div>}
                {connectionIdError && <div className="text-red-500 text-sm mt-1">{connectionIdError}</div>}
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
                  disabled={submitting || highConsumptionWarning || !!connectionIdError}
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

export default ReadingsPage; 