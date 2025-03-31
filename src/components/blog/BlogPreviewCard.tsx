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

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 flex-grow">
        <Link 
          href={`/blog/${slug}`}
          className="block font-bold text-xl mb-2 hover:text-blue-600 transition-colors"
        >
          {title}
        </Link>
        
        {author && (
          <p className="text-sm text-gray-500 mb-2">By {author}</p>
        )}
        
        <p className="text-sm text-gray-500 mb-3">
          {format(date, 'MM/dd/yyyy')}
        </p>
        
        <p className="text-gray-700 mb-4">
          {contentPreview}
        </p>
      </div>
      
      <div className="border-t border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-gray-500">
            <span role="img" aria-label="like" className="mr-1">👍</span>
            <span>{likes}</span>
          </span>
          
          <span className="flex items-center text-gray-500">
            <span role="img" aria-label="dislike" className="mr-1">👎</span>
            <span>{dislikes}</span>
          </span>
        </div>
        
        <Link 
          href={`/blog/${slug}`}
          className="text-blue-600 hover:underline text-sm"
        >
          Read More →
        </Link>
      </div>
    </Card>
  );
}