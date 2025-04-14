import React from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  className?: string;
}

export function Avatar({ src, alt, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-gray-200',
        className
      )}
      {...props}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          objectFit="cover"
          priority={true}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
} 