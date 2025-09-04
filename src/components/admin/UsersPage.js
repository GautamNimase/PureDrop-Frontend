import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const initialFormState = {
  Name: '',
  Address: '',
  Phone: '',
  Email: '',
  ConnectionType: '',
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
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

  const openAddForm = () => {
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setFormData({
      Name: user.Name,
      Address: user.Address,
      Phone: user.Phone,
      Email: user.Email,
      ConnectionType: user.ConnectionType,
    });
    setIsEdit(true);
    setEditId(user.UserID);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setIsEdit(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.Name.trim()) errors.Name = 'Name is required';
    if (!formData.Address.trim()) errors.Address = 'Address is required';
    if (!formData.Phone.trim()) {
      errors.Phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.Phone)) {
      errors.Phone = 'Phone must be exactly 10 digits';
    }
    if (!formData.Email.trim()) {
      errors.Email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.Email)) {
      errors.Email = 'Invalid email format';
    }
    if (!formData.ConnectionType.trim()) errors.ConnectionType = 'Connection Type is required';
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
      const url = isEdit ? `/api/users/${editId}` : '/api/users';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        // If backend returns validation errors, show them in the form
        if (errorData.details) {
          setFormErrors(errorData.details);
        } else {
          alert(errorData.error || 'Failed to save user');
        }
        setSubmitting(false);
        return;
      }
      const user = await res.json();
      if (isEdit) {
        setUsers((prev) => prev.map((u) => u.UserID === user.UserID ? user : u));
      } else {
        setUsers((prev) => [...prev, user]);
      }
      closeForm();
      setSuccessMsg(isEdit ? 'User updated successfully!' : 'User added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
      setSuccessMsg('User deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <p className="text-gray-600">Manage user information and accounts</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add User
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2">UserID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">ConnectionType</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.UserID}>
                  <td className="border px-4 py-2">{user.UserID}</td>
                  <td className="border px-4 py-2">{user.Name}</td>
                  <td className="border px-4 py-2">{user.Address}</td>
                  <td className="border px-4 py-2">{user.Phone}</td>
                  <td className="border px-4 py-2">{user.Email}</td>
                  <td className="border px-4 py-2">{user.ConnectionType}</td>
                  <td className="border px-4 py-2 flex gap-2 justify-center items-center">
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-indigo-400 text-white rounded-full shadow-md border border-indigo-300 hover:bg-indigo-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-150"
                      onClick={() => openEditForm(user)}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2" /></svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-rose-400 text-white rounded-full shadow-md border border-rose-300 hover:bg-rose-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-150"
                      onClick={() => handleDelete(user.UserID)}
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
          aria-labelledby="user-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-lg shadow-lg p-4 sm:p-8 flex flex-col justify-center animate-fadein-scale relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="user-modal-desc"
          >
            <h3 id="user-modal-title" className="text-xl font-bold mb-4 text-center text-blue-700">{isEdit ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="user-modal-desc">
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="user-name">Name</label>
                <input
                  id="user-name"
                  ref={firstInputRef}
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Name ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.Name && <div className="text-red-500 text-sm mt-1">{formErrors.Name}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="user-address">Address</label>
                <input
                  id="user-address"
                  type="text"
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Address ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  disabled={isEdit}
                />
                {formErrors.Address && <div className="text-red-500 text-sm mt-1">{formErrors.Address}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="user-phone">Phone</label>
                <input
                  id="user-phone"
                  type="text"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Phone ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                />
                {formErrors.Phone && <div className="text-red-500 text-sm mt-1">{formErrors.Phone}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="user-email">Email</label>
                <input
                  id="user-email"
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Email ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                />
                {formErrors.Email && <div className="text-red-500 text-sm mt-1">{formErrors.Email}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="user-connection-type">Connection Type</label>
                <select
                  id="user-connection-type"
                  name="ConnectionType"
                  value={formData.ConnectionType}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.ConnectionType ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                >
                  <option value="">Select Type</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
                {formErrors.ConnectionType && <div className="text-red-500 text-sm mt-1">{formErrors.ConnectionType}</div>}
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

export default UsersPage; 