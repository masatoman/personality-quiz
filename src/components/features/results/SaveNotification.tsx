import React from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface SaveNotificationProps {
  savingResults: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

const SaveNotification: React.FC<SaveNotificationProps> = ({
  savingResults,
  saveSuccess,
  saveError,
}) => {
  if (savingResults) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded shadow-md">
        保存中...
      </div>
    );
  }

  if (saveSuccess) {
    return (
      <div className="fixed top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded shadow-md flex items-center">
        <FaCheckCircle className="mr-2" />
        結果を保存しました
      </div>
    );
  }

  if (saveError) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow-md flex items-center">
        <FaExclamationCircle className="mr-2" />
        {saveError}
      </div>
    );
  }

  return null;
};

export default SaveNotification; 