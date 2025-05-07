"use client";
import { motion } from 'framer-motion';
import React from 'react';

interface WelcomeMotionProps {
  children: React.ReactNode;
}

export const WelcomeMotion: React.FC<WelcomeMotionProps> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    role="main"
    aria-label="ウェルカムページ"
  >
    {children}
  </motion.div>
); 