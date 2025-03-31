'use client';

import React, { useState } from 'react';
import { BlogPostView } from '@/components/blog/BlogPostView';
import { getClientAnonymousId } from '@/lib/utils';

interface BlogPostClientProps {
  blog: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    author_name?: string;
    like_count?: number; // Changed from likes to like_count to match DB field
    dislike_count?: number; // Changed from dislikes to dislike_count to match DB field
  };
}

export default function BlogPostClient({ blog }: BlogPostClientProps) {
  // Update these to use the correct field names
  const [likes, setLikes] = useState(blog.like_count ?? 0);
  const [dislikes, setDislikes] = useState(blog.dislike_count ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/blogs/${blog.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: 'like',
          anonymous_user_id: getClientAnonymousId(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both API response formats (likes/dislikes or like_count/dislike_count)
        setLikes(data.like_count !== undefined ? data.like_count : data.likes || 0);
        setDislikes(data.dislike_count !== undefined ? data.dislike_count : data.dislikes || 0);
        
        // Add debug logs
        console.log('Like update response:', data);
      } else {
        console.error('Error response from like API:', await response.text());
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDislike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/blogs/${blog.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: 'dislike',
          anonymous_user_id: getClientAnonymousId(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both API response formats
        setLikes(data.like_count !== undefined ? data.like_count : data.likes || 0);
        setDislikes(data.dislike_count !== undefined ? data.dislike_count : data.dislikes || 0);
        
        // Add debug logs
        console.log('Dislike update response:', data);
      } else {
        console.error('Error response from dislike API:', await response.text());
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  console.log('Rendering BlogPostClient with likes:', likes, 'dislikes:', dislikes);
  
  return (
    <BlogPostView
      title={blog.title}
      content={blog.content}
      date={new Date(blog.created_at)}
      author={blog.author_name || 'Anonymous'}
      likes={likes}
      dislikes={dislikes}
      onLike={handleLike}
      onDislike={handleDislike}
    />
  );
}