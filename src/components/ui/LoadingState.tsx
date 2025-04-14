import { twMerge } from 'tailwind-merge';
import { Spinner } from './Spinner';

interface LoadingStateProps {
  showText?: boolean;
  text?: string;
  className?: string;
}

export function LoadingState({
  showText = false,
  text = '読み込み中...',
  className
}: LoadingStateProps) {
  return (
    <div className={twMerge('flex flex-col items-center justify-center', className)}>
      <Spinner className="w-8 h-8 text-blue-500" />
      {showText && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
} 