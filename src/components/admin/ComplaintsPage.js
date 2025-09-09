import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const initialFormState = {
  UserID: '',
  Date: '',
  Type: '',
  Description: '',
  Status: 'Open',
  Response: ''
};

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
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
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch complaints from backend
  const fetchComplaints = () => {
    setLoading(true);
    fetch('/api/complaints')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch complaints');
        return res.json();
      })
      .then(data => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Auto-open edit modal if navigated with action=edit
  useEffect(() => {
    if (
      location.state &&
      location.state.action === 'edit' &&
      complaints.length > 0 &&
      !showForm
    ) {
      openEditForm(complaints[0]);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, complaints, showForm, navigate, location.pathname]);

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
    setFormErrors({});
  };

  const openEditForm = (complaint) => {
    setFormData({
      UserID: complaint.UserID,
      Date: complaint.Date,
      Type: complaint.Type,
      Description: complaint.Description,
      Status: complaint.Status,
      Response: complaint.Response || ''
    });
    setIsEdit(true);
    setEditId(complaint.ComplaintID);
    setShowForm(true);
    setFormErrors({});
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
    if (!formData.UserID) errors.UserID = 'UserID is required';
    if (!formData.Date) errors.Date = 'Date is required';
    if (!formData.Type) errors.Type = 'Type is required';
    if (!formData.Description) errors.Description = 'Description is required';
    if (!formData.Status) errors.Status = 'Status is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/complaints/${editId}` : '/api/complaints';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save complaint');
        return res.json();
      })
      .then(() => {
        fetchComplaints();
        closeForm();
      })
      .catch(err => {
        setFormErrors({ api: err.message });
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete complaint');
      fetchComplaints();
      setSuccessMsg('Complaint deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complaints Management</h2>
        <p className="text-gray-600">Manage user complaints and responses</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add Complaint
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading complaints...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">ComplaintID</th>
                <th className="px-4 py-2">UserID</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Response</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-8">No complaints found.</td>
                </tr>
              ) : complaints.map((complaint, index) => (
                <tr key={complaint.ComplaintID || complaint._id}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{complaint.UserID}</td>
                  <td className="border px-4 py-2">{complaint.Date}</td>
                  <td className="border px-4 py-2">{complaint.Type}</td>
                  <td className="border px-4 py-2">{complaint.Status}</td>
                  <td className="border px-4 py-2 max-w-xs truncate" title={complaint.Description}>{complaint.Description}</td>
                  <td className="border px-4 py-2 max-w-xs truncate" title={complaint.Response}>{complaint.Response}</td>
                  <td className="border px-4 py-2 flex gap-2 justify-center items-center">
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-indigo-400 text-white rounded-full shadow-md border border-indigo-300 hover:bg-indigo-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-150"
                      onClick={() => openEditForm(complaint)}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2" /></svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-rose-400 text-white rounded-full shadow-md border border-rose-300 hover:bg-rose-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-150"
                      onClick={() => handleDelete(complaint.ComplaintID)}
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
          aria-labelledby="complaint-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-lg shadow-lg p-4 sm:p-8 flex flex-col justify-center animate-fadein-scale relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="complaint-modal-desc"
          >
            <h3 id="complaint-modal-title" className="text-xl font-bold mb-4 text-center text-blue-700">{isEdit ? 'Edit Complaint' : 'Add Complaint'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="complaint-modal-desc">
              {formErrors.api && <div className="text-red-500 text-sm mb-2">{formErrors.api}</div>}
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="user-id">UserID</label>
                <input
                  id="user-id"
                  ref={firstInputRef}
                  type="number"
                  name="UserID"
                  value={formData.UserID}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.UserID ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  min="1"
                  disabled={isEdit}
                />
                {formErrors.UserID && <div className="text-red-500 text-sm mt-1">{formErrors.UserID}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  name="Date"
                  value={formData.Date}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Date ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.Date && <div className="text-red-500 text-sm mt-1">{formErrors.Date}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="type">Type</label>
                <select
                  id="type"
                  name="Type"
                  value={formData.Type}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Type ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                >
                  <option value="">Select type</option>
                  <option value="Service">Service</option>
                  <option value="Water Quality">Water Quality</option>
                  <option value="Billing">Billing</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.Type && <div className="text-red-500 text-sm mt-1">{formErrors.Type}</div>}
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
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                {formErrors.Status && <div className="text-red-500 text-sm mt-1">{formErrors.Status}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Description ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  rows={2}
                />
                {formErrors.Description && <div className="text-red-500 text-sm mt-1">{formErrors.Description}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="response">Response (optional)</label>
                <textarea
                  id="response"
                  name="Response"
                  value={formData.Response}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  rows={2}
                />
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

export default ComplaintsPage; 