'use client';

import React from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface SaveNotificationProps {
  success: boolean;
  error: string | null;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({ success, error }) => {
  return (
    <>
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                結果が正常に保存されました。プロフィールページで確認できます。
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveNotification; 