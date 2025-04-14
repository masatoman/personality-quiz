import React from 'react';
import { motion } from 'framer-motion';

export interface SaveNotificationProps {
  success: boolean;
  error: string | null;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({ success, error }) => {
  if (!success && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-4 p-4 rounded-lg ${
        success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {success ? '結果が保存されました' : error}
    </motion.div>
  );
};

export default SaveNotification; 