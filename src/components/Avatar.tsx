import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'busy' | 'offline';
  rounded?: 'rounded-full' | 'rounded-xl' | 'rounded-lg';
}

const SIZE_CONFIG = {
  xs: { sizeClass: 'w-5 h-5 text-[9px]', dotClass: 'w-1.5 h-1.5' },
  sm: { sizeClass: 'w-7 h-7 text-[11px]', dotClass: 'w-2 h-2' },
  md: { sizeClass: 'w-8 h-8 text-xs', dotClass: 'w-2.5 h-2.5' },
  lg: { sizeClass: 'w-10 h-10 text-sm', dotClass: 'w-2.5 h-2.5' },
  xl: { sizeClass: 'w-12 h-12 text-base', dotClass: 'w-3 h-3' },
};

const GRADIENTS = [
  'from-sky-500 to-indigo-600 text-white',
  'from-emerald-500 to-teal-700 text-white',
  'from-violet-500 to-purple-700 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-cyan-500 to-blue-600 text-white',
  'from-fuchsia-500 to-rose-600 text-white',
  'from-teal-500 to-emerald-700 text-white',
];

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradient(name?: string): string {
  if (!name) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'sm',
  className = '',
  showStatus = false,
  status = 'online',
  rounded = 'rounded-full'
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const gradient = getGradient(name);
  const { sizeClass, dotClass } = SIZE_CONFIG[size] || SIZE_CONFIG.sm;

  const hasValidImage = src && !imgError && !src.includes('undefined');

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClass} ${rounded} overflow-hidden flex items-center justify-center font-bold font-mono tracking-wider ring-1 ring-white/20 select-none bg-gradient-to-br ${gradient} shadow-sm`}
      >
        {hasValidImage ? (
          <img
            src={src}
            alt=""
            aria-hidden="true"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="leading-none drop-shadow-sm">{initials}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotClass} rounded-full ring-2 ring-[#0B0F17] ${
            status === 'online'
              ? 'bg-emerald-400'
              : status === 'busy'
              ? 'bg-amber-400'
              : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
};
