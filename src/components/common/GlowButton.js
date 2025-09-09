import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GlowButton = memo(({ 
  children, 
  onClick, 
  className = '',
  color = 'blue',
  size = 'md',
  disabled = false,
  loading = false,
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
      hover: 'hover:from-blue-600 hover:to-purple-600',
      shadow: 'hover:shadow-blue-500/25'
    },
    green: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      hover: 'hover:from-green-600 hover:to-green-700',
      shadow: 'hover:shadow-green-500/25'
    },
    orange: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      hover: 'hover:from-orange-600 hover:to-orange-700',
      shadow: 'hover:shadow-orange-500/25'
    }
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const glowVariants = {
    hover: {
      boxShadow: [
        "0 0 0 0 rgba(59, 130, 246, 0.4)",
        "0 0 0 8px rgba(59, 130, 246, 0)",
        "0 0 0 0 rgba(59, 130, 246, 0)"
      ],
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const rippleVariants = {
    initial: { scale: 0, opacity: 0.6 },
    animate: { 
      scale: 1, 
      opacity: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const handleClick = (e) => {
    if (disabled || loading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      key: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.key !== newRipple.key));
    }, 600);
    
    if (onClick) onClick(e);
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      variants={glowVariants}
      whileHover={!disabled && !loading ? "hover" : {}}
    >
      <motion.button
        className={`relative overflow-hidden group flex items-center gap-2 ${colors.bg} ${colors.hover} text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${colors.shadow} ${sizeClasses[size]} font-inter font-semibold ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={handleClick}
        variants={buttonVariants}
        whileHover={!disabled && !loading ? "hover" : {}}
        whileTap={!disabled && !loading ? "tap" : {}}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.key}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            variants={rippleVariants}
            initial="initial"
            animate="animate"
          />
        ))}
      </motion.button>
    </motion.div>
  );
});

GlowButton.displayName = 'GlowButton';

export default GlowButton;
