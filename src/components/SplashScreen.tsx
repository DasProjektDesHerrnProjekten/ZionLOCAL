import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const SplashScreen = ({ isLoading = true }: { isLoading?: boolean }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Simulate loading
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-white font-sans transition-colors duration-500 overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-14 w-full"></div>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full px-10">
          <div className="relative w-56 h-56 mb-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/15 dark:bg-primary/10 rounded-full blur-3xl"></div>
            <img
              alt="Zionian Examination Logo"
              className="w-full h-full object-contain relative z-10"
              src="/logo.png"
            />
          </div>

          <div className="text-center space-y-2">
            <motion.h1
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Zionians <span className="text-primary">Examination</span>
            </motion.h1>
            <motion.p 
              className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.8 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Excellence in Learning
            </motion.p>
          </div>
        </div>
        
        <div className="pb-24 flex flex-col items-center">
          <motion.div 
            className="relative w-7 h-7"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="absolute inset-0 border-[3px] border-gray-200 dark:border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-2 w-36 h-[5px] bg-black/10 dark:bg-white/10 rounded-full left-1/2 -translate-x-1/2"></div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;