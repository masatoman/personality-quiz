import { cache } from 'react';
import { cookies } from 'next/headers';
import { GiverScore } from './score';

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

  return res.json() as Promise<{
    score: GiverScore;
    activities: any[];
    diagnosis: any;
  }>;
}); 