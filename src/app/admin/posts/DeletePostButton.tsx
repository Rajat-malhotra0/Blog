'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeletePostButton({ postId }: { postId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      console.log("Sending delete request for post ID:", postId);
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Delete failed:", data);
        throw new Error(data.error || 'Failed to delete post');
      }
      
      console.log("Delete successful:", data);
      
      // Force a hard refresh to update the list
      window.location.reload();
      // Or use router refresh if you prefer:
      // router.refresh();
      
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}