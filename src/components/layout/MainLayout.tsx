'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ClientOnly from '../ClientOnly';
import { cn } from '@/lib/utils';

type MainLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col",
        "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950",
        "transition-colors duration-300",
        className
      )} 
      suppressHydrationWarning={true}
    >
      <Navbar />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
          {children}
        </div>
      </main>
      
      <ClientOnly>
        <Footer />
      </ClientOnly>
    </div>
  );
}