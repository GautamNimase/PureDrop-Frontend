import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  WifiIcon,
  MapPinIcon,
  BeakerIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ConnectionCard = memo(({ 
  connection, 
  variants, 
  buttonVariants,
  onCardClick,
  onViewDetails,
  onEdit,
  onDelete,
  formatDate,
  getStatusIcon,
  getStatusColor
}) => {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={() => onCardClick(connection)}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Card Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <WifiIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#111827] font-poppins">
                #{connection.ConnectionID || connection._id.slice(-8)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(connection.Status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.Status)}`}>
                  {connection.Status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Details */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3">
            <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#6b7280] font-inter">Address</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 font-poppins truncate">
                {connection.Address || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BeakerIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#6b7280] font-inter">Meter No.</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 font-poppins truncate">
                {connection.MeterNumber || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#6b7280] font-inter">Last Reading</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 font-poppins">
                {formatDate(connection.LastReadingDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 sm:p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100/50">
        <div className="flex gap-1 sm:gap-2">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(connection);
            }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            title="View detailed information"
            className="flex-1 px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">View Details</span>
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(connection);
            }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            title="Edit connection details"
            className="flex-1 px-2 sm:px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Edit</span>
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(connection);
            }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            title="Delete this connection"
            className="flex-1 px-2 sm:px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Delete</span>
          </motion.button>
        </div>
      </div>

      {/* Status Alert */}
      {connection.Status?.toLowerCase() === 'suspended' && (
        <div className="p-3 sm:p-4 bg-orange-50/80 backdrop-blur-sm border-t border-orange-200/50">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-orange-800 font-poppins">Connection Suspended</p>
              <p className="text-xs font-medium text-orange-700 mt-1 font-inter">
                Please contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {connection.Status?.toLowerCase() === 'inactive' && (
        <div className="p-3 sm:p-4 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200/50">
          <div className="flex items-start gap-2">
            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-800 font-poppins">Connection Inactive</p>
              <p className="text-xs font-medium text-gray-700 mt-1 font-inter">
                Contact support to reactivate.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
});

ConnectionCard.displayName = 'ConnectionCard';

export default ConnectionCard;
