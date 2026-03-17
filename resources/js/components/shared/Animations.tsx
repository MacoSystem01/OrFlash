import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export const PageTransition = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerList = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div variants={stagger} initial="hidden" animate="show" className={className}>
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div variants={item} className={className}>
    {children}
  </motion.div>
);

export const CardHover = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    className={`surface relative overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="relative">{children}</div>
  </motion.div>
);
