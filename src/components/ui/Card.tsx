import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children?: ReactNode;
  href?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
}

export function Card({ 
  children, 
  className, 
  href, 
  variant = 'default',
  hover = true 
}: CardProps) {
  const baseStyles = "group h-full border rounded-2xl transition-all duration-300 overflow-hidden";
  
  const variantStyles = {
    default: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md",
    glass: "glass border-white/20 dark:border-white/10 shadow-xl",
    gradient: "bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-blue-950 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl",
    elevated: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl"
  };
  
  const hoverStyles = hover ? "hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500" : "";
  
  const CardWrapper = ({ children }: { children: ReactNode }) => (
    <div 
      className={cn(
        baseStyles,
        variantStyles[variant],
        hoverStyles,
        "animate-fade-in",
        className
      )}
    >
      <div className="p-6 h-full relative z-10">
        {children}
      </div>
      {/* Subtle gradient overlay for enhanced depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 rounded-2xl pointer-events-none" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <CardWrapper>{children}</CardWrapper>
      </Link>
    );
  }

  return <CardWrapper>{children}</CardWrapper>;
}