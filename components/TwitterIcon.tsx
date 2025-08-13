import React from 'react';

interface TwitterIconProps {
  size?: number;
  className?: string;
}

export function TwitterIcon({ size = 20, className = '' }: TwitterIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Twitter/X logo - simplified X shape */}
      <path
        d="M11.9 8.26L19.36 0H17.61L11.13 7.18L5.95 0H0L7.77 11.12L0 19.73H1.75L8.53 12.23L14.05 19.73H20L11.9 8.26ZM9.4 11.24L8.62 10.11L2.38 1.3H5.1L10.15 8.41L10.93 9.54L17.61 18.43H14.89L9.4 11.24Z"
        fill="currentColor"
      />
    </svg>
  );
}