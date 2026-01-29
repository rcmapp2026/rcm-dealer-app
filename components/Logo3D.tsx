
import React from 'react';
import { motion as m } from 'framer-motion';
import { APP_LOGO } from '../constants';
import { clsx } from 'clsx';

// Workaround for broken environment types for framer-motion
const motion = m as any;

interface Logo3DProps {
  className?: string;
  delay?: number;
}

export const Logo3D: React.FC<Logo3DProps> = ({ className, delay = 0 }) => {
  return (
    <motion.img
      src={APP_LOGO}
      className={clsx("animate-glow-pulse", className)}
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay,
        duration: 1.5
      }}
    />
  );
};