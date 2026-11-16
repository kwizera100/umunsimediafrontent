import React, { useMemo, useState } from 'react';

// Builds a smooth scalloped seal (Facebook-style verified rosette):
// alternating outer/inner radius points joined by quadratic curves
// so peaks and valleys are both rounded.
const buildSealPath = (points = 14) => {
  const cx = 12, cy = 12, rOuter = 10.9, rInner = 8.9;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const mid = (a, b) => `${((a[0] + b[0]) / 2).toFixed(2)} ${((a[1] + b[1]) / 2).toFixed(2)}`;
  let d = `M ${mid(pts[0], pts[pts.length - 1])}`;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const next = pts[(i + 1) % pts.length];
    d += ` Q ${p[0].toFixed(2)} ${p[1].toFixed(2)} ${mid(p, next)}`;
  }
  return d + ' Z';
};

const VerificationBadge = ({
  size = 'sm',
  color = '#0866FF',
  className = '',
  showTooltip = true
}) => {
  const [showTip, setShowTip] = useState(false);
  const sealPath = useMemo(() => buildSealPath(), []);

  const sizeClasses = {
    sm: 'h-[20px] w-[20px]',
    md: 'h-[22px] w-[22px]',
    lg: 'h-7 w-7',
    xl: 'h-8 w-8'
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
        className={`${sizeClasses[size]} drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`}
        fill="none"
        aria-label="Verified Account"
        role="img"
      >
        {/* Scalloped seal */}
        <path d={sealPath} fill={color} />
        {/* White checkmark */}
        <path
          d="M7.7 12.4L10.8 15.5L16.5 9.4"
          stroke="#FFFFFF"
          strokeWidth="2.4"
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
