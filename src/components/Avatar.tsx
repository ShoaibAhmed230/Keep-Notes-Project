'use client';

import React from 'react';

interface AvatarProps {
  url?: string | null;
  name?: string | null;
  email?: string | null;
  /** Tailwind size classes, e.g. "w-10 h-10". */
  className?: string;
  textClassName?: string;
}

export function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || '').trim() || (email || '').split('@')[0] || '';
  if (!source) return '?';

  const words = source.split(/[\s._-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function Avatar({ url, name, email, className = 'w-10 h-10', textClassName = 'text-sm' }: AvatarProps) {
  return (
    <div
      className={`${className} rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 text-indigo-300`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name || email || 'Profile photo'} className="w-full h-full object-cover" />
      ) : (
        <span className={`${textClassName} font-black tracking-tight select-none`}>
          {getInitials(name, email)}
        </span>
      )}
    </div>
  );
}
