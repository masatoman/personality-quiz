import { Spinner } from './Spinner';

interface LoadingStateProps {
  showText?: boolean;
  text?: string;
  className?: string;
}

export function LoadingState({ 
  showText = false, 
  text = 'Loading...', 
  className = '' 
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Spinner size="lg" />
      {showText && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
} 