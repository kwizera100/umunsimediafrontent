import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

// Renders a media house logo, falling back to an icon when missing/broken
const MediaHouseLogo = ({ logo, name, size = 40, rounded = 'rounded-lg' }) => {
  const [error, setError] = useState(false);
  const px = `${size}px`;
  const iconSize = Math.round(size * 0.5);

  return (
    <div
      className={`${rounded} bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden relative`}
      style={{ width: px, height: px }}
    >
      <Building2 className="text-blue-500" style={{ width: iconSize, height: iconSize }} />
      {logo && !error && (
        <img
          src={logo}
          alt={name || 'Media house'}
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default MediaHouseLogo;
