'use client';

import React from 'react';
import { format } from 'date-fns';
import { unescapeHTML } from '@/lib/utils';

interface BlogPostViewProps {
  title: string;
  content: string;
  date: Date;
  author?: string;
  likes: number;
  dislikes: number;
  onLike: () => void;
  onDislike: () => void;
}

export function BlogPostView({
  title,
  content,
  date,
  author = 'Anonymous',
  likes = 0,
  dislikes = 0,
  onLike,
  onDislike
}: BlogPostViewProps): React.ReactElement {
  // For debugging - log the content to see what we're receiving
  console.log("Content to render:", content);
  
  return (
    <article className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 rounded-2xl p-8 mb-8 border border-border/30 dark:border-border-dark/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6 leading-tight">{title}</h1>
          
          <div className="flex items-center space-x-4 text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-500/20 dark:ring-blue-400/30">
                <span className="text-white font-semibold text-lg">
                  {author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-foreground">By {author}</div>
                <div className="text-sm">Posted on {format(date, 'MMMM d, yyyy')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-card/80 dark:bg-card-dark/80 backdrop-blur-sm rounded-2xl border border-border/30 dark:border-border-dark/30 overflow-hidden">
        <div className="p-8">
          <div 
            className="blog-content prose prose-lg max-w-none dark:prose-invert prose-headings:gradient-text prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-border/30 dark:prose-pre:border-border-dark/30 prose-pre:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:rounded-r-lg prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: unescapeHTML(content) }} 
          />
        </div>
        
        {/* Interaction Section */}
        <div className="border-t border-border/30 dark:border-border-dark/30 bg-muted/30 dark:bg-muted-dark/30 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              What did you think of this article?
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={onLike}
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-105 border border-green-200/50 dark:border-green-800/50"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">{likes}</span>
              </button>
              
              <button
                onClick={onDislike}
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-105 border border-red-200/50 dark:border-red-800/50"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">{dislikes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}