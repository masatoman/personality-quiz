import { PersonalityType } from '@/types/quiz';
import ResultClient from './ResultClient';

export function generateStaticParams() {
  return [
    { type: 'giver' },
    { type: 'taker' },
    { type: 'matcher' }
  ];
}

export default function ResultPage({
  params
}: {
  params: { type: PersonalityType }
}) {
  return <ResultClient personalityType={params.type} />;
} 