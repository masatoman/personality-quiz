import React from 'react';
import { Container, Typography, Button, Box, Stack, Paper, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { WelcomeMotion } from '@/components/features/welcome/WelcomeMotion';
import { Save } from '@mui/icons-material';

export default function InitialProfilePage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <WelcomeMotion>
        <Stack spacing={6}>
          <Box textAlign="center" role="banner">
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              プロフィール設定
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              あなたの情報を入力して、学習を始めましょう
            </Typography>
          </Box>

          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <form>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    基本情報
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      label="ニックネーム"
                      required
                      fullWidth
                      inputProps={{
                        'aria-required': 'true',
                      }}
                    />
                    <TextField
                      label="自己紹介"
                      multiline
                      rows={4}
                      fullWidth
                      helperText="あなたの学習目標や興味のある分野を書いてみましょう"
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    学習設定
                  </Typography>
                  <Stack spacing={3}>
                    <FormControl fullWidth required>
                      <InputLabel id="english-level-label">現在の英語レベル</InputLabel>
                      <Select
                        labelId="english-level-label"
                        label="現在の英語レベル"
                        defaultValue=""
                        inputProps={{
                          'aria-required': 'true',
                        }}
                      >
                        <MenuItem value="beginner">初級（TOEIC 300-500）</MenuItem>
                        <MenuItem value="intermediate">中級（TOEIC 500-700）</MenuItem>
                        <MenuItem value="advanced">上級（TOEIC 700-900）</MenuItem>
                        <MenuItem value="fluent">ネイティブレベル（TOEIC 900+）</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                      <InputLabel id="study-goal-label">学習目標</InputLabel>
                      <Select
                        labelId="study-goal-label"
                        label="学習目標"
                        defaultValue=""
                        inputProps={{
                          'aria-required': 'true',
                        }}
                      >
                        <MenuItem value="business">ビジネス英語の習得</MenuItem>
                        <MenuItem value="academic">学術英語の習得</MenuItem>
                        <MenuItem value="daily">日常英会話の上達</MenuItem>
                        <MenuItem value="exam">資格試験対策</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                      <InputLabel id="study-time-label">1日の学習目標時間</InputLabel>
                      <Select
                        labelId="study-time-label"
                        label="1日の学習目標時間"
                        defaultValue=""
                        inputProps={{
                          'aria-required': 'true',
                        }}
                      >
                        <MenuItem value="15">15分</MenuItem>
                        <MenuItem value="30">30分</MenuItem>
                        <MenuItem value="60">1時間</MenuItem>
                        <MenuItem value="90">1時間30分</MenuItem>
                        <MenuItem value="120">2時間以上</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    通知設定
                  </Typography>
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel id="notification-label">通知頻度</InputLabel>
                      <Select
                        labelId="notification-label"
                        label="通知頻度"
                        defaultValue="daily"
                      >
                        <MenuItem value="daily">毎日</MenuItem>
                        <MenuItem value="weekly">週1回</MenuItem>
                        <MenuItem value="none">通知を受け取らない</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>

                <Box textAlign="center" sx={{ mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    sx={{
                      px: 6,
                      py: 2,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                    }}
                  >
                    プロフィールを保存
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </WelcomeMotion>
    </Container>
  );
} 