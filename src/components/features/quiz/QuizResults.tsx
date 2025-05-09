'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container, Paper, Typography, Button, Box, Stack, LinearProgress, Card, CardContent, CardActions, Chip, Divider } from '@mui/material';
import { Lightbulb, Refresh, AutoStories, ArrowForward, School, Timer } from '@mui/icons-material';
import { QuizResults as QuizResultsType } from './types';

// 教材の型定義
interface Material {
  id: number;
  title: string;
  duration: string;
  level: string;
  description: string;
}

interface QuizResultsProps {
  results: QuizResultsType;
  onRetake?: () => void;
  isQuickMode?: boolean;
  recommendedMaterials?: Material[];
  onGoToMaterial?: (materialId: number) => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ 
  results, 
  onRetake,
  isQuickMode = false,
  recommendedMaterials = [],
  onGoToMaterial
}) => {
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
            {isQuickMode && (
              <Chip 
                label="簡易診断結果" 
                color="secondary" 
                size="small" 
                sx={{ alignSelf: 'flex-start', mb: -2 }} 
              />
            )}
            
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

            {recommendedMaterials && recommendedMaterials.length > 0 && (
              <>
                <Divider />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 1 }} />
                    おすすめクイックスタート教材
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    あなたの学習タイプに合わせた5分以内で完了できる教材です
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2 
                  }}>
                    {recommendedMaterials.map((material) => (
                      <Box 
                        key={material.id} 
                        sx={{ 
                          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' },
                          minWidth: { xs: '100%', sm: 'calc(50% - 8px)' } 
                        }}
                      >
                        <Card 
                          elevation={2} 
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: 6
                            }
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h3" gutterBottom>
                              {material.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Chip 
                                icon={<Timer fontSize="small" />} 
                                label={material.duration} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                              <Chip 
                                label={material.level} 
                                size="small" 
                                color="secondary" 
                                variant="outlined" 
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {material.description}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              endIcon={<ArrowForward />}
                              onClick={() => onGoToMaterial && onGoToMaterial(material.id)}
                              sx={{ ml: 'auto' }}
                            >
                              学習する
                            </Button>
                          </CardActions>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {onRetake && (
                <Button
                  variant="outlined"
                  startIcon={<Refresh aria-hidden="true" />}
                  onClick={onRetake}
                  aria-label="診断をやり直す"
                >
                  診断をやり直す
                </Button>
              )}
              
              {isQuickMode && (
                <Button
                  variant="contained"
                  startIcon={<AutoStories />}
                  onClick={() => {
                    onRetake && onRetake();
                    // ここに詳細診断に切り替えるロジックを追加できます
                  }}
                >
                  詳細診断を受ける
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}; 