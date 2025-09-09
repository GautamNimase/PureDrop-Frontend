import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InlineEditField = ({ 
  value, 
  onSave, 
  onCancel, 
  fieldType = 'text',
  placeholder = '',
  className = '',
  icon: Icon,
  iconColor = 'blue',
  tooltip = '',
  isEditing,
  onEdit,
  children
}) => {
  const [editingValue, setEditingValue] = useState(value || '');

  const handleSave = () => {
    if (editingValue !== '') {
      onSave(editingValue);
    }
  };

  const handleCancel = () => {
    setEditingValue(value || '');
    onCancel();
  };

  const handleEdit = () => {
    setEditingValue(value || '');
    onEdit();
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500'
  };

  const borderColorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    orange: 'border-orange-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500'
  };

  const hoverColorClasses = {
    blue: 'hover:text-blue-600',
    green: 'hover:text-green-600',
    orange: 'hover:text-orange-600',
    purple: 'hover:text-purple-600',
    gray: 'hover:text-gray-600'
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type={fieldType}
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          className={`font-bold text-gray-900 font-poppins text-lg bg-transparent border-b-2 ${borderColorClasses[iconColor]} focus:outline-none flex-1 ${className}`}
          placeholder={placeholder}
          autoFocus
        />
        <motion.button
          onClick={handleSave}
          className="p-1 text-green-500 hover:bg-green-100 rounded"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <CheckIcon className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={handleCancel}
          className="p-1 text-red-500 hover:bg-red-100 rounded"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <XMarkIcon className="w-4 h-4" />
        </motion.button>
      </div>
    );
  }

  return (
    <div 
      className={`font-bold text-gray-900 font-poppins text-lg cursor-pointer ${hoverColorClasses[iconColor]} transition-colors ${className}`}
      onClick={handleEdit}
      title={tooltip}
    >
      {children || value || '-'}
    </div>
  );
};

export default InlineEditField;
