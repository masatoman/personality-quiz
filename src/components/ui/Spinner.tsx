import { twMerge } from 'tailwind-merge';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={twMerge(
        'animate-spin rounded-full border-4 border-gray-200',
        'border-t-blue-500',
        className
      )}
      role="status"
      aria-label="読み込み中"
    />
  );
} 