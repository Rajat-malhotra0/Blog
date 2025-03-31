import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children?: ReactNode;
  href?: string;
}

export function Card({ children, className, href }: CardProps) {
  const CardWrapper = ({ children }: { children: ReactNode }) => (
    <div 
      className={cn(
        "group p-6 h-full border border-gray-300 dark:border-gray-700 rounded-xl transition-all duration-200",
        "hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600",
        "bg-white dark:bg-gray-800",
        className
      )}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <CardWrapper>{children}</CardWrapper>
      </Link>
    );
  }

  return <CardWrapper>{children}</CardWrapper>;
}