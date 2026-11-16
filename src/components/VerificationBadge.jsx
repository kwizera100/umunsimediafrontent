import React, { useState } from 'react';

const VerificationBadge = ({ 
  size = 'sm', 
  color = '#0084FF',
  className = '',
  showTooltip = true
}) => {
  const [showTip, setShowTip] = useState(false);

  const sizeClasses = {
    sm: 'h-[18px] w-[18px]',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  };

  return (
    <span 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]}`}
        fill="none"
        aria-label="Verified Account"
        role="img"
      >
        <defs>
          <filter id="meta-badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.15)"/>
          </filter>
        </defs>
        {/* 16-point scalloped starburst circle */}
        <path
          d="M12 2L13.5 3.5L15.6 2.8L16.5 4.8L18.7 4.5L19 6.6L21 7.2L20.5 9.2L22 10.5L21 12L22 13.5L20.5 14.8L21 16.8L19 17.4L18.7 19.5L16.5 19.2L15.6 21.2L13.5 20.5L12 22L10.5 20.5L8.4 21.2L7.5 19.2L5.3 19.5L5 17.4L3 16.8L3.5 14.8L2 13.5L3 12L2 10.5L3.5 9.2L3 7.2L5 6.6L5.3 4.5L7.5 4.8L8.4 2.8L10.5 3.5Z"
          fill={color}
          filter="url(#meta-badge-shadow)"
        />
        {/* White checkmark - 45deg angle, thick rounded caps */}
        <path
          d="M8 12.5L10.5 15L16 9.5"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showTooltip && showTip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#242526] text-white text-xs rounded-md whitespace-nowrap pointer-events-none z-[9999] shadow-lg">
          Verified Account
        </span>
      )}
    </span>
  );
};

export default VerificationBadge;
