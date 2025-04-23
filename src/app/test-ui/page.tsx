import { Metadata } from 'next';
import TestUIPage from './TestUIPage';

export const metadata: Metadata = {
  title: 'テストUI',
  description: 'テストUI用のページです',
};

export default function Page() {
  return <TestUIPage />;
} 