'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container, Paper, Typography, Button, Box, Stack, LinearProgress } from '@mui/material';
import { Lightbulb, Refresh } from '@mui/icons-material';
import { QuizResults as QuizResultsType } from './types';

interface QuizResultsProps {
  results: QuizResultsType;
  onRetake?: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ results, onRetake }) => {
  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'giver':
        return '他者の学習をサポートすることで、自身も成長するタイプです。教材作成や質問への回答を通じて学習効果を高められます。';
      case 'taker':
        return '効率的な学習方法を見つけ、積極的に知識を吸収するタイプです。質の高い教材を選び、集中的に学習することで成果を上げられます。';
      case 'matcher':
        return '他者との相互学習を通じて成長するタイプです。ディスカッションやグループ学習を活用することで、より深い理解が得られます。';
      default:
        return '';
    }
  };

  const dominantTypeLabel = {
    giver: 'ギバータイプ',
    taker: 'テイカータイプ',
    matcher: 'マッチャータイプ'
  }[results.dominantType];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        role="main"
        aria-label="診断結果"
      >
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 2 }}
          role="article"
          aria-labelledby="results-title"
        >
          <Stack spacing={4}>
            <Box
              textAlign="center"
              role="banner"
            >
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                fontWeight="bold"
                color="primary"
                id="results-title"
              >
                あなたの学習タイプ診断結果
              </Typography>
              <Typography
                variant="h4"
                color="text.secondary"
                gutterBottom
                aria-live="polite"
              >
                {dominantTypeLabel}
              </Typography>
            </Box>

            <Box role="contentinfo">
              <Typography
                variant="body1"
                paragraph
                aria-label="タイプの説明"
              >
                {getTypeDescription(results.dominantType)}
              </Typography>
            </Box>

            <Stack spacing={2} role="list" aria-label="タイプ別スコア">
              {Object.entries(results.percentage).map(([type, value]) => (
                <Box key={type} role="listitem">
                  <Typography
                    variant="body1"
                    gutterBottom
                    id={`${type}-score-label`}
                  >
                    {type === 'giver' && 'ギバー傾向'}
                    {type === 'taker' && 'テイカー傾向'}
                    {type === 'matcher' && 'マッチャー傾向'}
                    : {value}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{ height: 10, borderRadius: 5 }}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={value}
                    aria-labelledby={`${type}-score-label`}
                  />
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 4 }} role="complementary">
              <Typography
                variant="h5"
                gutterBottom
                id="advice-heading"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Lightbulb sx={{ mr: 1 }} aria-hidden="true" />
                あなたへのアドバイス
              </Typography>
              <Typography
                variant="body1"
                paragraph
                aria-labelledby="advice-heading"
              >
                {results.dominantType === 'giver' && (
                  '教材作成やフィードバック提供を通じて、知識の定着を図りましょう。他者の成長をサポートすることで、自身の理解も深まります。'
                )}
                {results.dominantType === 'taker' && (
                  '質の高い教材を選び、効率的な学習計画を立てましょう。定期的に学習の振り返りを行い、理解度を確認することが重要です。'
                )}
                {results.dominantType === 'matcher' && (
                  'ディスカッションやグループ学習に積極的に参加しましょう。他者との意見交換を通じて、多角的な視点を得ることができます。'
                )}
              </Typography>
            </Box>

            {onRetake && (
              <Box textAlign="center">
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Refresh aria-hidden="true" />}
                  onClick={onRetake}
                  sx={{ mt: 2 }}
                  aria-label="診断をやり直す"
                >
                  もう一度診断する
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}; 