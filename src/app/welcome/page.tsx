import React from 'react';
import { Metadata } from 'next'
import { Container, Stack, Typography, Button, Box, Paper } from '@mui/material'
import { motion } from 'framer-motion';
import { ArrowForward, School, Psychology, EmojiEvents } from '@mui/icons-material'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ようこそ | ShiftWith',
  description: 'ShiftWithへようこそ。あなたの学習タイプを見つけましょう。'
}

export default function WelcomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        role="main"
        aria-label="ウェルカムページ"
      >
        <Stack spacing={6}>
          <Box textAlign="center" role="banner">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="primary"
              sx={{ mb: 2 }}
            >
              ShiftWithへようこそ！
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              教えることで学ぶ、新しい英語学習の形
            </Typography>
          </Box>

          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Stack spacing={4}>
              <Typography variant="h4" component="h2" gutterBottom>
                はじめに
              </Typography>
              <Typography variant="body1" paragraph>
                ShiftWithは、あなたの英語学習をより効果的にするプラットフォームです。
                教材作成やフィードバック提供を通じて、より深い理解と確実な定着を実現します。
              </Typography>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Psychology color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      1. ギバー診断を受ける
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      あなたの学習タイプを診断し、最適な学習方法を提案します。
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <School color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      2. 教材を作成・共有
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      学んだ内容を教材にまとめ、他の学習者と共有しましょう。
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmojiEvents color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      3. ポイントを獲得
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      教材作成やフィードバック提供でポイントを獲得し、特典と交換できます。
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Stack>
          </Paper>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              component={Link}
              href="/quiz"
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                borderRadius: 2,
              }}
            >
              ギバー診断を始める
            </Button>
          </Box>
        </Stack>
      </motion.div>
    </Container>
  )
} 