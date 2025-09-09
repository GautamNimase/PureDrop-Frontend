import { useMemo } from 'react';

const useOptimizedAnimations = (isMobile = false) => {
  return useMemo(() => {
    // Reduce animation complexity on mobile for better performance
    const baseVariants = {
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: isMobile ? 0.1 : 0.15,
            delayChildren: isMobile ? 0.1 : 0.2
          }
        }
      },
      card: {
        hidden: { 
          opacity: 0, 
          y: isMobile ? 10 : 30,
          scale: isMobile ? 0.98 : 0.95
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: { 
            duration: isMobile ? 0.4 : 0.6, 
            ease: "easeOut",
            type: "spring",
            stiffness: isMobile ? 80 : 100,
            damping: isMobile ? 20 : 15
          }
        }
      },
      button: {
        hover: { 
          scale: isMobile ? 1.02 : 1.05,
          transition: { duration: 0.2, ease: "easeOut" }
        },
        tap: { 
          scale: isMobile ? 0.98 : 0.95,
          transition: { duration: 0.1 }
        }
      },
      glow: {
        hover: {
          boxShadow: [
            "0 0 0 0 rgba(59, 130, 246, 0.4)",
            `0 0 0 ${isMobile ? '4px' : '8px'} rgba(59, 130, 246, 0)`,
            "0 0 0 0 rgba(59, 130, 246, 0)"
          ],
          transition: { duration: 0.6, ease: "easeOut" }
        }
      }
    };

    return baseVariants;
  }, [isMobile]);
};

export default useOptimizedAnimations;