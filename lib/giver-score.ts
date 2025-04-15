import { cache } from 'react';
import { cookies } from 'next/headers';
import { GiverScore } from './score';
import { Activity, GiverDiagnosis } from '@prisma/client';

export type GiverScoreResponse = {
  score: GiverScore;
  activities: Activity[];
  diagnosis: GiverDiagnosis | null;
};

export const getGiverScore = cache(async () => {
  const userId = cookies().get('userId')?.value;
  if (!userId) throw new Error('Unauthorized');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/giver-score`, {
    next: { 
      revalidate: 30,  // 30秒でキャッシュを再検証
      tags: ['giver-score']
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch giver score');
  }

  return res.json() as Promise<GiverScoreResponse>;
}); 