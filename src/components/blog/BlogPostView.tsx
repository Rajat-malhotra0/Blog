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
    <article className="p-6">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      
      <div className="flex items-center text-gray-500 text-sm mb-6">
        <span>By {author}</span>
        <span className="mx-2">•</span>
        <span>Posted on {format(date, 'MMM d, yyyy')}</span>
      </div>
      
      {/* Option 1: Using dangerouslySetInnerHTML */}
      <div 
        className="blog-content prose max-w-none"
        dangerouslySetInnerHTML={{ __html: unescapeHTML(content) }} 
      />
      
      {/* Option 2: Alternative rendering approach - uncomment this if Option 1 doesn't work
      <div className="blog-content prose max-w-none mb-6">
        <iframe
          srcDoc={content}
          title={title}
          className="w-full border-0 min-h-[200px]"
          style={{ height: 'auto' }}
        />
      </div>
      */}
      
      <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-gray-200">
        <button 
          onClick={onLike}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-500"
        >
          <span role="img" aria-label="like">👍</span>
          <span>{likes}</span>
        </button>
        
        <button
          onClick={onDislike}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
        >
          <span role="img" aria-label="dislike">👎</span>
          <span>{dislikes}</span>
        </button>
      </div>
    </article>
  );
}