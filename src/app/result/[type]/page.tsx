import { Suspense } from 'react';
import { PersonalityType } from '@/types/quiz';
import ResultClient from './ResultClient';

export function generateStaticParams() {
  return [
    { type: 'giver' },
    { type: 'taker' },
    { type: 'matcher' }
  ];
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-mesh py-8 px-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">結果を読み込み中...</p>
      </div>
    </div>
  );
}

export default function ResultPage({
  params
}: {
  params: { type: PersonalityType }
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultClient personalityType={params.type} />
    </Suspense>
  );
} 