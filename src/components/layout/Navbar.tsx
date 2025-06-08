'use client'

import Link from 'next/link';
import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-background/80 dark:bg-background-dark/80 backdrop-blur-xl shadow-lg border-b border-border/30 dark:border-border-dark/30 sticky top-0 z-50 transition-colors duration-700" suppressHydrationWarning={true}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning={true}>
        <div className="flex justify-between items-center h-16" suppressHydrationWarning={true}>
          <div className="flex-shrink-0" suppressHydrationWarning={true}>
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ring-2 ring-blue-500/20 dark:ring-blue-400/30">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-all duration-300">
                Anonymous Blog
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4" suppressHydrationWarning={true}>
            <Link 
              href="/create" 
              className="group flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25 font-medium relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="relative z-10">Write Post</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}