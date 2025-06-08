'use client';

import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-14 h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full transition-all duration-500 focus-ring shadow-lg border border-gray-300/50 dark:border-gray-600/50"
      aria-label="Toggle theme"
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 opacity-100' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 opacity-100'
      }`} />
      
      {/* Toggle circle */}
      <div
        className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-500 transform flex items-center justify-center text-sm shadow-xl ring-2 ring-white/20 ${
          isDark 
            ? 'translate-x-7 bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-300' 
            : 'translate-x-1 bg-gradient-to-br from-white to-gray-100 text-orange-500'
        }`}
      >
        <span className="transition-all duration-300">
          {isDark ? '🌙' : '☀️'}
        </span>
      </div>
    </button>
  );
}