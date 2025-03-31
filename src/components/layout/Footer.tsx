'use client'

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 shadow py-6" suppressHydrationWarning={true}>
      <div className="container mx-auto px-4" suppressHydrationWarning={true}>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning={true}>
          <p suppressHydrationWarning={true}>© {new Date().getFullYear()} Anonymous Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}