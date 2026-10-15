import React from 'react';

interface LxLogoProps {
  className?: string;
  isDarkTheme?: boolean;
}

export const LxLogo: React.FC<LxLogoProps> = ({ className = 'h-7', isDarkTheme = true }) => {
  // Official LX brand colors
  // Red symbol: #A62624 (LX Red)
  // Text color: on dark theme -> #FFFFFF / #E2E8F0, on light theme -> #5C544E (LX Warm Gray)
  const textColor = isDarkTheme ? '#FFFFFF' : '#5C544E';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official LX Emblem Symbol */}
      <svg
        viewBox="0 0 100 100"
        className="h-full w-auto aspect-square shrink-0 rounded-lg overflow-hidden shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Red rounded square background */}
        <rect width="100" height="100" rx="16" fill="#A62624" />

        {/* LX White geometric logo mark */}
        {/* The mark is a stylized 'L' with dynamic geometric ascending facet */}
        <path
          d="M 28 20 
             L 42 20 
             L 42 63 
             L 60 48 
             L 75 60 
             L 45 84 
             L 28 70 
             Z"
          fill="#FFFFFF"
        />
        <path
          d="M 45 84
             L 75 60
             L 75 72
             L 45 84
             Z"
          fill="#F1F5F9"
          opacity="0.9"
        />
      </svg>

      {/* Brand Text: LX MMA */}
      <div className="flex items-baseline gap-1.5 font-sans tracking-tight leading-none">
        <span
          className="text-xl sm:text-2xl font-black tracking-normal"
          style={{
            color: textColor,
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          LX
        </span>
        <span
          className="text-xl sm:text-2xl font-extrabold tracking-normal"
          style={{
            color: textColor,
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '0.04em',
          }}
        >
          MMA
        </span>
      </div>
    </div>
  );
};
