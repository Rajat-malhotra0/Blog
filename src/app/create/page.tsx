'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import BlogEditor from '@/components/blog/BlogEditor';

// Fix the inputRef type to accept null
interface InputProps {
  id: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  inputRef: React.RefObject<HTMLInputElement>;  // This is the key change
  label: string;
}

interface EditorProps {
  onContentChange: (content: string) => void;
}

// Create uncontrolled input components to prevent focus loss
const TextInput = React.memo<InputProps>(({ id, placeholder, required, defaultValue, inputRef, label }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <input
      id={id}
      type="text"
      ref={inputRef}
      defaultValue={defaultValue}
      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md
                 bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
      required={required}
      placeholder={placeholder}
    />
  </div>
));

const EditorContainer = React.memo<EditorProps>(({ onContentChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      Content
    </label>
    <BlogEditor onContentChange={onContentChange} />
  </div>
));

export default function CreatePost() {
  const router = useRouter();
  // Fix ref declaration with type assertion
  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Use a ref to avoid re-renders
  const handleEditorChange = useCallback((html: string) => {
    contentRef.current = html;
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const title = titleRef.current?.value || '';
    const author = authorRef.current?.value || '';

    if (!title.trim() || !contentRef.current.trim()) {
      setError('Title and content are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: contentRef.current,
          author_name: author,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.slug) {
        router.push(`/blog/${data.slug}`);
      } else {
        router.push('/blog');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Card className="max-w-4xl mx-auto">
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            <TextInput 
              id="title"
              label="Title"
              placeholder="Enter the blog title"
              required={true}
              inputRef={titleRef as React.RefObject<HTMLInputElement>}
            />
            
            <TextInput 
              id="author-name"
              label="Author Name"
              placeholder="Enter your name (optional)"
              inputRef={authorRef as React.RefObject<HTMLInputElement>}
            />
            
            <EditorContainer onContentChange={handleEditorChange} />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </MainLayout>
  );
}