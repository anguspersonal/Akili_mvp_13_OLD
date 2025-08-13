import React from 'react';

interface FacebookIconProps {
  size?: number;
  className?: string;
}

export function FacebookIcon({ size = 20, className = '' }: FacebookIconProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Blue circular background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: '#1877F2',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* White Facebook "f" logo */}
      <svg
        width={size * 0.5}
        height={size * 0.8}
        viewBox="0 0 10 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <path
          d="M6.25 16V8.7H8.75L9.125 5.85H6.25V4.05C6.25 3.25 6.5 2.7 7.65 2.7H9.25V0.15C8.95 0.1 7.95 0 6.8 0C4.4 0 2.75 1.45 2.75 4.1V5.85H0.25V8.7H2.75V16H6.25Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}