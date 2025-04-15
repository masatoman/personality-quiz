'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, LinearProgress, Stack, ButtonBase } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { QuizQuestion } from './types';

interface QuizFormProps {
  question: QuizQuestion;
  selectedOption: number | null;
  onOptionSelect: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  progress: number;
  canGoBack: boolean;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  question,
  selectedOption,
  onOptionSelect,
  onPrevious,
  onNext,
  progress,
  canGoBack
}) => {
  // キーボードナビゲーションの処理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoBack) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && selectedOption !== null) {
        onNext();
      } else if (e.key >= '1' && e.key <= String(question.options.length)) {
        onOptionSelect(parseInt(e.key) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canGoBack, selectedOption, onPrevious, onNext, onOptionSelect, question.options.length]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      role="form"
      aria-label="診断質問フォーム"
    >
      <Box sx={{ width: '100%', mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="質問の進捗状況"
        />
        <Typography variant="body2" sx={{ mt: 1 }} aria-live="polite">
          進捗状況: {Math.round(progress)}%
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }} role="heading" aria-level={2}>
        <Typography variant="h4" component="h2" gutterBottom>
          {question.text}
        </Typography>
        {question.description && (
          <Typography variant="body1" color="text.secondary">
            {question.description}
          </Typography>
        )}
      </Box>

      <Stack
        spacing={2}
        sx={{ mb: 6 }}
        role="radiogroup"
        aria-label="回答オプション"
      >
        {question.options.map((option, index) => (
          <ButtonBase
            key={index}
            onClick={() => onOptionSelect(index)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onOptionSelect(index);
              }
            }}
            role="radio"
            aria-checked={selectedOption === index}
            aria-label={`選択肢 ${index + 1}: ${option.text}`}
            tabIndex={0}
            sx={{
              width: '100%',
              textAlign: 'left',
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: selectedOption === index ? 'primary.main' : 'grey.300',
              bgcolor: selectedOption === index ? 'primary.50' : 'background.paper',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px'
              }
            }}
          >
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {option.text}
              </Typography>
              {option.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {option.description}
                </Typography>
              )}
            </Box>
          </ButtonBase>
        ))}
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        role="navigation"
        aria-label="質問ナビゲーション"
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onPrevious}
          disabled={!canGoBack}
          aria-label="前の質問へ戻る"
        >
          前の質問
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={onNext}
          disabled={selectedOption === null}
          aria-label={progress === 100 ? '診断結果を表示する' : '次の質問へ進む'}
        >
          {progress === 100 ? '結果を見る' : '次の質問'}
        </Button>
      </Stack>
    </motion.div>
  );
}; 