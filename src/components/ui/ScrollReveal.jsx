import React from 'react';
import { motion } from 'framer-motion';

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.65,
  yOffset = 30,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.8, 0.25, 1], // Premium cubic-bezier transition
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
