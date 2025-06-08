'use client';

import React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { unescapeHTML } from '@/lib/utils';

interface BlogPreviewCardProps {
  id: string;
  title: string;
  content: string;
  slug: string;
  date: Date;
  likes: number;
  dislikes: number;
  author?: string;
}

export function BlogPreviewCard({
  id,
  title,
  content,
  slug,
  date,
  likes = 0,
  dislikes = 0,
  author
}: BlogPreviewCardProps): React.ReactElement {
  // Extract a preview of the content without HTML tags
  const createContentPreview = (htmlContent: string) => {
    // First unescape the HTML
    const unescaped = unescapeHTML(htmlContent);
    
    // Create a temporary element to strip HTML tags
    const tempElement = document.createElement('div');
    tempElement.innerHTML = unescaped;
    
    // Get the text content
    const textContent = tempElement.textContent || '';
    
    // Limit to 150 characters
    return textContent.length > 150 
      ? textContent.substring(0, 150) + '...'
      : textContent;
  };

  const contentPreview = createContentPreview(content);
  const totalInteractions = likes + dislikes;
  const likePercentage = totalInteractions > 0 ? (likes / totalInteractions) * 100 : 0;

  return (
    <Card variant="elevated" className="h-full flex flex-col group cursor-pointer overflow-hidden relative">
      {/* Gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/30 dark:via-transparent dark:to-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10 flex-grow space-y-4 p-6">
        {/* Header with author and date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-500/20 dark:ring-blue-400/30 group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-semibold text-sm">
                {author ? author.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-foreground">{author || 'Anonymous'}</span>
              <div className="text-xs text-muted-foreground">
                {format(date, 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <Link href={`/blog/${slug}`} className="block">
          <h3 className="font-bold text-xl text-foreground group-hover:gradient-text transition-all duration-300 line-clamp-2 leading-tight">
            {title}
          </h3>
        </Link>
        
        {/* Content Preview */}
        <p className="text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
          {contentPreview}
        </p>
      </div>
      
      {/* Footer with engagement */}
      <div className="relative z-10 mt-auto p-6 pt-4 border-t border-border/60 dark:border-border-dark/60 bg-card/50 dark:bg-card-dark/50">
        <div className="flex items-center justify-between">
          {/* Engagement metrics */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-red-500 transition-colors duration-300">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{likes}</span>
            </div>
            
            {totalInteractions > 0 && (
              <div className="flex-1 max-w-20">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 shadow-sm" 
                    style={{ width: `${likePercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Read more link */}
          <Link 
            href={`/blog/${slug}`}
            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium group-hover:translate-x-1 transition-all duration-300 hover:scale-105"
          >
            <span>Read more</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </Card>
  );
}