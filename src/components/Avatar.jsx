import React, { useMemo, useState } from 'react';

const BASE_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'https://fggg.space';

function getDisplayName(user) {
  if (!user) return 'Unknown User';
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  return user.username || user.name || 'Unknown User';
}

function getInitials(user) {
  const name = getDisplayName(user);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '';
  return (first + last).toUpperCase() || 'U';
}

function resolveAvatarUrl(user) {
  if (!user || !user.avatar) return '';
  const avatar = user.avatar;
  if (typeof avatar !== 'string') return '';
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('uploads/')) return `${BASE_URL}/${avatar}`;
  if (avatar.startsWith('avatars/')) return `${BASE_URL}/uploads/${avatar}`;
  return `${BASE_URL}/uploads/avatars/${avatar}`;
}

const colorPairs = [
  ['from-blue-500 to-indigo-500', 'text-white'],
  ['from-purple-500 to-pink-500', 'text-white'],
  ['from-green-500 to-emerald-500', 'text-white'],
  ['from-amber-500 to-orange-500', 'text-black'],
  ['from-cyan-500 to-sky-500', 'text-white'],
  ['from-rose-500 to-red-500', 'text-white']
];

const Avatar = ({ user, className = '', textClassName = '', alt }) => {
  const [errored, setErrored] = useState(false);
  const url = useMemo(() => resolveAvatarUrl(user), [user]);
  const initials = useMemo(() => getInitials(user), [user]);
  const altText = alt || getDisplayName(user);

  const colorIndex = useMemo(() => {
    const key = (user?.id || user?.username || getDisplayName(user)).toString();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return hash % colorPairs.length;
  }, [user]);

  const [bgGradient, textColor] = colorPairs[colorIndex];

  if (!url || errored) {
    return (
      <div className={`rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center font-bold select-none ${className}`} title={altText} aria-label={altText}>
        <span className={`${textColor} ${textClassName}`}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={altText}
      className={`rounded-full object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
};

export default Avatar;


