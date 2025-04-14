import { Suspense } from 'react';
import MaterialsList from './_components/MaterialsList';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MaterialsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">教材一覧</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <MaterialsList />
      </Suspense>
    </div>
  );
} 