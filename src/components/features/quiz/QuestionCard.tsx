import { motion } from 'framer-motion';
import { Question } from '@/types/quiz';

interface QuestionCardProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
}

export const QuestionCard = ({
  question,
  currentQuestion,
  totalQuestions,
  onAnswer,
}: QuestionCardProps) => {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              質問 {currentQuestion + 1} / {totalQuestions}
            </span>
            <div className="progress-container">
              <div className="progress-info">
                <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                <span>{Math.round((currentQuestion + 1) / totalQuestions * 100)}%</span>
              </div>
              <div 
                className="progress-bar" 
                role="progressbar"
                aria-valuenow={Math.round((currentQuestion + 1) / totalQuestions * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }} 
                />
              </div>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{question.text}</h2>
        </div>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswer(index)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300" />
              <div className="relative flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mr-4 transition-all duration-300">
                  <span className="text-gray-600 group-hover:text-blue-600 font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="text-gray-800 group-hover:text-gray-900 font-medium">
                  {option.text}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}; 