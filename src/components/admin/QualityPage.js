import React, { useState, useRef, useEffect } from 'react';
import { formatDate } from '../../utils/dateFormatter';

const initialFormState = { SourceID: '', Date: '', pH: '', Contaminants: '' };

const placeholderQuality = [
  { QualityID: 1, SourceID: 1, Date: '2023-06-01', pH: 7.2, Contaminants: 'None' },
  { QualityID: 2, SourceID: 2, Date: '2023-06-02', pH: 6.8, Contaminants: 'Lead' },
  { QualityID: 3, SourceID: 3, Date: '2023-06-03', pH: 7.0, Contaminants: 'None' },
];

const QualityPage = () => {
  const [quality, setQuality] = useState(placeholderQuality);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

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

  const openEditForm = (q) => {
    setFormData({ SourceID: q.SourceID, Date: q.Date, pH: q.pH, Contaminants: q.Contaminants });
    setIsEdit(true);
    setEditId(q.QualityID);
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
    if (!formData.SourceID) errors.SourceID = 'SourceID is required';
    if (!formData.Date) errors.Date = 'Date is required';
    if (!formData.pH || isNaN(formData.pH) || formData.pH < 0 || formData.pH > 14) errors.pH = 'pH must be a number between 0 and 14';
    if (!formData.Contaminants.trim()) errors.Contaminants = 'Contaminants is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      if (isEdit) {
        setQuality((prev) => prev.map(q => q.QualityID === editId ? { ...q, ...formData } : q));
        setSuccessMsg('Water quality record updated successfully!');
      } else {
        const nextId = quality.length ? Math.max(...quality.map(q => q.QualityID)) + 1 : 1;
        setQuality((prev) => [...prev, { QualityID: nextId, ...formData }]);
        setSuccessMsg('Water quality record added successfully!');
      }
      closeForm();
      setTimeout(() => setSuccessMsg(''), 3000);
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Water Quality Management</h2>
        <p className="text-gray-600">Manage water quality records and monitoring data</p>
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openAddForm}
        >
          Add Water Quality Record
        </button>
        {successMsg && (
          <div className="mt-2 text-green-600 font-medium">{successMsg}</div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2">QualityID</th>
              <th className="px-4 py-2">SourceID</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">pH</th>
              <th className="px-4 py-2">Contaminants</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quality.map((q, index) => (
              <tr key={q.QualityID || q._id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{q.SourceID}</td>
                <td className="border px-4 py-2">{formatDate(q.Date)}</td>
                <td className="border px-4 py-2">{q.pH}</td>
                <td className="border px-4 py-2">{q.Contaminants}</td>
                <td className="border px-4 py-2 flex gap-2 justify-center items-center">
                  <button
                    className="flex items-center gap-1 px-4 py-1 bg-indigo-400 text-white rounded-full shadow-md border border-indigo-300 hover:bg-indigo-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-150"
                    onClick={() => openEditForm(q)}
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 13.362-13.303ZM19 7l-2-2" /></svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-4 py-1 bg-rose-400 text-white rounded-full shadow-md border border-rose-300 hover:bg-rose-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-150"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this water quality record?')) {
                        setQuality(prev => prev.filter(r => r.QualityID !== q.QualityID));
                        setSuccessMsg('Water quality record deleted successfully!');
                        setTimeout(() => setSuccessMsg(''), 3000);
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
      </div>
      {/* Modal Form for Add/Edit */}
      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-blue-100/80 via-white/80 to-blue-200/80"
          onClick={closeForm}
          aria-modal="true"
          role="dialog"
          aria-labelledby="quality-modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-lg shadow-lg p-4 sm:p-8 flex flex-col justify-center animate-fadein-scale relative focus:outline-none"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
            aria-describedby="quality-modal-desc"
          >
            <h3 id="quality-modal-title" className="text-xl font-bold mb-4 text-center text-blue-700">{isEdit ? 'Edit Water Quality Record' : 'Add Water Quality Record'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" id="quality-modal-desc">
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="source-id">SourceID</label>
                <input
                  id="source-id"
                  ref={firstInputRef}
                  type="number"
                  name="SourceID"
                  value={formData.SourceID}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.SourceID ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  min="1"
                />
                {formErrors.SourceID && <div className="text-red-500 text-sm mt-1">{formErrors.SourceID}</div>}
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
                />
                {formErrors.Date && <div className="text-red-500 text-sm mt-1">{formErrors.Date}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="ph">pH</label>
                <input
                  id="ph"
                  type="number"
                  name="pH"
                  value={formData.pH}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.pH ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                  min="0"
                  max="14"
                  step="0.01"
                />
                {formErrors.pH && <div className="text-red-500 text-sm mt-1">{formErrors.pH}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700" htmlFor="contaminants">Contaminants</label>
                <input
                  id="contaminants"
                  type="text"
                  name="Contaminants"
                  value={formData.Contaminants}
                  onChange={handleChange}
                  className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${formErrors.Contaminants ? 'border-red-500' : 'border-gray-300'}`}
                  required
                  aria-required="true"
                />
                {formErrors.Contaminants && <div className="text-red-500 text-sm mt-1">{formErrors.Contaminants}</div>}
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

export default QualityPage; 