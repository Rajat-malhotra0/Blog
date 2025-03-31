'use client'

import Link from 'next/link';
import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow" suppressHydrationWarning={true}>
      <div className="container mx-auto px-4" suppressHydrationWarning={true}>
        <div className="flex justify-between items-center h-16" suppressHydrationWarning={true}>
          <div className="flex-shrink-0" suppressHydrationWarning={true}>
            <Link href="/" className="text-xl font-bold">
              Anonymous Blog
            </Link>
          </div>
          <div className="flex items-center space-x-4" suppressHydrationWarning={true}>
            <Link href="/create" className="hover:text-blue-600 dark:hover:text-blue-400">
              Write Post
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}