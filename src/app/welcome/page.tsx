import React from 'react';
import { Metadata } from 'next'
import { Container, Stack, Typography, Box } from '@mui/material'
import { WelcomeMotion } from '@/components/features/welcome/WelcomeMotion';
import OnboardingFlow from '@/components/features/welcome/OnboardingFlow';

export const metadata: Metadata = {
  title: 'ようこそ | ShiftWith',
  description: 'ShiftWithへようこそ。効果的な学習を始めましょう。'
}

export default function WelcomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <WelcomeMotion>
        <Stack spacing={8}>
          {/* ヒーローセクション */}
          <Box textAlign="center" role="banner">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="primary"
              sx={{ 
                mb: 2,
                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🎉 ShiftWithへようこそ！
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
              「教えることで学ぶ」新しい英語学習の始まり
            </Typography>
            
            {/* 簡潔な価値提案 */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 6
            }}>
              <Box className="bg-blue-50 rounded-lg p-4">
                <Typography variant="h6" color="primary" gutterBottom>
                  ⚡ 効果的
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  記憶定着率90%向上
                </Typography>
              </Box>
              <Box className="bg-green-50 rounded-lg p-4">
                <Typography variant="h6" color="primary" gutterBottom>
                  🤝 協働的
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  コミュニティで成長
                </Typography>
              </Box>
              <Box className="bg-purple-50 rounded-lg p-4">
                <Typography variant="h6" color="primary" gutterBottom>
                  🏆 継続的
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ポイントで動機維持
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* インタラクティブオンボーディング */}
          <OnboardingFlow />

          {/* 統計情報 */}
          <Box className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <Typography variant="h5" component="h2" textAlign="center" gutterBottom fontWeight="bold">
              📊 ShiftWithの効果
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 4,
              mt: 4
            }}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold" color="primary">
                  90%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  記憶定着率向上
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold" color="primary">
                  85%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  継続率向上
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold" color="primary">
                  300%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  学習効果向上
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold" color="primary">
                  3分
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  診断完了時間
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 利用者の声 */}
          <Box>
            <Typography variant="h5" component="h2" textAlign="center" gutterBottom fontWeight="bold">
              💬 利用者の声
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4,
              mt: 4
            }}>
              <Box className="bg-white rounded-xl p-6 shadow-sm border">
                <Typography variant="body1" paragraph color="text.secondary" fontStyle="italic">
                  "教材を作ることで、自分の理解度が明確になりました。他の人からのフィードバックも参考になります。"
                </Typography>
                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                  - 大学生 Aさん
                </Typography>
              </Box>
              <Box className="bg-white rounded-xl p-6 shadow-sm border">
                <Typography variant="body1" paragraph color="text.secondary" fontStyle="italic">
                  "ギバー診断で自分に合った学習方法が分かり、効率的に学習できるようになりました。"
                </Typography>
                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                  - 社会人 Bさん
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* フッター情報 */}
          <Box textAlign="center" sx={{ py: 4, borderTop: '1px solid #E5E7EB' }}>
            <Typography variant="body2" color="text.secondary">
              質問やサポートが必要な場合は、いつでもお気軽にお問い合わせください。
            </Typography>
          </Box>
        </Stack>
      </WelcomeMotion>
    </Container>
  )
} 