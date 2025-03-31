'use client';

import { useState, useEffect } from 'react';
import { Blog } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { getClientAnonymousId } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BlogInteractionsProps {
  blog: Blog;
}

export default function BlogInteractions({ blog }: BlogInteractionsProps) {
  const [likes, setLikes] = useState(blog.like_count || 0);
  const [dislikes, setDislikes] = useState(blog.dislike_count || 0);
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load the user's previous interaction when component mounts
  useEffect(() => {
    const loadUserInteraction = async () => {
      try {
        // Get the anonymous user ID
        const anonymousId = await getClientAnonymousId();
        setUserId(anonymousId);
        
        // Check for previous interaction in localStorage first (faster UX)
        const storedInteraction = localStorage.getItem(`blog_${blog.id}_interaction`);
        if (storedInteraction) {
          setUserInteraction(storedInteraction as 'like' | 'dislike' | null);
        }
        
        // Then fetch from the server to ensure data is in sync
        const response = await fetch(`/api/blogs/${blog.id}/interaction?user_id=${anonymousId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.interaction) {
            setUserInteraction(data.interaction.interaction_type);
            // Update localStorage with server data
            localStorage.setItem(`blog_${blog.id}_interaction`, data.interaction.interaction_type);
          }
          
          // Update counts with latest from server
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
        }
      } catch (error) {
        console.error("Error loading user interaction:", error);
      }
    };

    loadUserInteraction();
  }, [blog.id]);

  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (isLoading || !userId) return;
    
    setIsLoading(true);
    
    // Store the previous state in case we need to revert
    const previousInteraction = userInteraction;
    const previousLikes = likes;
    const previousDislikes = dislikes;
    
    // If clicking the same button twice, treat as toggling off
    if (userInteraction === type) {
      // Optimistic update
      if (type === 'like') {
        setLikes(prev => prev - 1);
      } else {
        setDislikes(prev => prev - 1);
      }
      setUserInteraction(null);
      localStorage.removeItem(`blog_${blog.id}_interaction`);
    } else {
      // If switching from like to dislike or vice versa
      if (userInteraction === 'like' && type === 'dislike') {
        setLikes(prev => prev - 1);
        setDislikes(prev => prev + 1);
      } else if (userInteraction === 'dislike' && type === 'like') {
        setDislikes(prev => prev - 1);
        setLikes(prev => prev + 1);
      } else {
        // New interaction
        if (type === 'like') {
          setLikes(prev => prev + 1);
        } else {
          setDislikes(prev => prev + 1);
        }
      }
      setUserInteraction(type);
      localStorage.setItem(`blog_${blog.id}_interaction`, type);
    }

    try {
      const response = await fetch(`/api/blogs/${blog.id}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interaction_type: userInteraction === type ? 'none' : type,
          anonymous_user_id: userId,
        }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setLikes(previousLikes);
        setDislikes(previousDislikes);
        setUserInteraction(previousInteraction);
        
        // Also revert localStorage
        if (previousInteraction) {
          localStorage.setItem(`blog_${blog.id}_interaction`, previousInteraction);
        } else {
          localStorage.removeItem(`blog_${blog.id}_interaction`);
        }
        
        console.error('Failed to save interaction');
      } else {
        // Update with server values to ensure consistency
        const data = await response.json();
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      // Revert optimistic update on error
      setLikes(previousLikes);
      setDislikes(previousDislikes);
      setUserInteraction(previousInteraction);
      
      // Also revert localStorage
      if (previousInteraction) {
        localStorage.setItem(`blog_${blog.id}_interaction`, previousInteraction);
      } else {
        localStorage.removeItem(`blog_${blog.id}_interaction`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleInteraction('like')}
        className={cn(
          "flex items-center gap-2 transition-all",
          userInteraction === 'like' && "text-blue-600 dark:text-blue-400 font-medium"
        )}
        disabled={isLoading}
      >
        <span className="text-xl">👍</span>
        <span>{likes}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleInteraction('dislike')}
        className={cn(
          "flex items-center gap-2 transition-all",
          userInteraction === 'dislike' && "text-red-600 dark:text-red-400 font-medium"
        )}
        disabled={isLoading}
      >
        <span className="text-xl">👎</span>
        <span>{dislikes}</span>
      </Button>
    </div>
  );
}