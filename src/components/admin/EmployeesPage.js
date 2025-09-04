import React, { useState, useRef, useEffect } from 'react';

const initialFormState = { Name: '', Role: '', Contact: '' };

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
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

  // Fetch employees from backend
  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/employees')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch employees');
        return res.json();
      })
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
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

  const openEditForm = (emp) => {
    setFormData({ Name: emp.Name, Role: emp.Role, Contact: emp.Contact });
    setIsEdit(true);
    setEditId(emp.EmployeeID);
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
    if (!formData.Name.trim()) errors.Name = 'Name is required';
    if (!formData.Role.trim()) errors.Role = 'Role is required';
    if (!formData.Contact.trim()) errors.Contact = 'Contact is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    if (isEdit) {
      // Edit employee via API
      fetch(`/api/employees/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update employee');
          return res.json();
        })
        .then(updated => {
          setEmployees(prev => prev.map(emp => emp.EmployeeID === editId ? updated : emp));
          setSuccessMsg('Employee updated successfully!');
          closeForm();
          setTimeout(() => setSuccessMsg(''), 3000);
        })
        .catch(err => {
          setFormErrors({ api: err.message });
        })
        .finally(() => setSubmitting(false));
    } else {
      // Add employee via API
      fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to add employee');
          return res.json();
        })
        .then(added => {
          setEmployees(prev => [...prev, added]);
          setSuccessMsg('Employee added successfully!');
          closeForm();
          setTimeout(() => setSuccessMsg(''), 3000);
        })
        .catch(err => {
          setFormErrors({ api: err.message });
        })
        .finally(() => setSubmitting(false));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Employees Management</h2>
        <p className="text-gray-600">Manage employee information and roles</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add Employee
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p>Loading employees...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2">EmployeeID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.EmployeeID}>
                  <td className="border px-4 py-2">{emp.EmployeeID}</td>
                  <td className="border px-4 py-2">{emp.Name}</td>
                  <td className="border px-4 py-2">{emp.Role}</td>
                  <td className="border px-4 py-2">{emp.Contact}</td>
                  <td className="border px-4 py-2 flex gap-2 justify-center items-center">
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-indigo-400 text-white rounded-full shadow-md border border-indigo-300 hover:bg-indigo-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-150"
                      onClick={() => openEditForm(emp)}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2" /></svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 px-4 py-1 bg-rose-400 text-white rounded-full shadow-md border border-rose-300 hover:bg-rose-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-150"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this employee?')) {
                          try {
                            const res = await fetch(`/api/employees/${emp.EmployeeID}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Failed to delete employee');
                            setEmployees(prev => prev.filter(e => e.EmployeeID !== emp.EmployeeID));
                            setSuccessMsg('Employee deleted successfully!');
                            setTimeout(() => setSuccessMsg(''), 3000);
                          } catch (err) {
                            setError(err.message);
                          }
                        }
                      }}
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
          aria-labelledby="employee-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-lg shadow-lg p-4 sm:p-8 flex flex-col justify-center animate-fadein-scale relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="employee-modal-desc"
          >
            <h3 id="employee-modal-title" className="text-xl font-bold mb-4 text-center text-blue-700">{isEdit ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="employee-modal-desc">
              {formErrors.api && <div className="text-red-500 text-sm mb-2">{formErrors.api}</div>}
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="name">Name</label>
                <input
                  id="name"
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
                <label className="block mb-1 font-medium text-gray-700" htmlFor="role">Role</label>
                <input
                  id="role"
                  type="text"
                  name="Role"
                  value={formData.Role}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Role ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                />
                {formErrors.Role && <div className="text-red-500 text-sm mt-1">{formErrors.Role}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="contact">Contact</label>
                <input
                  id="contact"
                  type="text"
                  name="Contact"
                  value={formData.Contact}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Contact ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                />
                {formErrors.Contact && <div className="text-red-500 text-sm mt-1">{formErrors.Contact}</div>}
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

export default EmployeesPage; 