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
        "min-h-screen flex flex-col relative",
        "bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950",
        "transition-all duration-700 ease-in-out",
        className
      )} 
      suppressHydrationWarning={true}
    >
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-green-400/15 to-blue-400/15 dark:from-green-600/8 dark:to-blue-600/8 rounded-full blur-2xl animate-bounce-subtle" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 dark:from-yellow-600/8 dark:to-orange-600/8 rounded-full blur-2xl animate-bounce-subtle" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 dark:from-blue-600/3 dark:via-purple-600/3 dark:to-pink-600/3 rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        <div className="glass shadow-2xl rounded-3xl p-6 md:p-10 border border-white/30 dark:border-gray-700/50 animate-slide-up backdrop-blur-xl">
          <div className="relative">
            {children}
          </div>
        </div>
      </main>
      
      <ClientOnly>
        <Footer />
      </ClientOnly>
    </div>
  );
}