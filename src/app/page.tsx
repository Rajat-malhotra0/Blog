import React from 'react';
import { supabase } from '@/lib/supabase/client';
import ClientOnly from '@/components/ClientOnly';
import MainLayout from '@/components/layout/MainLayout';
import { BlogPreviewCard } from '@/components/blog/BlogPreviewCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Blog } from '@/lib/types';

// Add revalidation every 30 seconds
export const revalidate = 30;

export default async function Home() {
  // Fetch blogs directly in the server component
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <MainLayout>
      <ClientOnly>
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 py-8">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text animate-scale-in">
              Share Your Voice
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Express yourself anonymously in a safe, welcoming community where every story matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/create">
                <Button 
                  variant="gradient" 
                  size="lg" 
                  className="min-w-[200px]"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Write Your Story
                </Button>
              </Link>
              {blogs && blogs.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Join {blogs.length} other{blogs.length !== 1 ? 's' : ''} sharing their thoughts
                </p>
              )}
            </div>
          </div>

          {/* Posts Header */}
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Posts</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Discover stories from our community
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl animate-slide-up">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">Unable to load posts</h3>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">Please try refreshing the page or check back later.</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {blogs && blogs.length === 0 && (
            <div className="text-center py-16 space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  No stories yet!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Be the first to share your thoughts and inspire others in our community.
                </p>
                <Link href="/create">
                  <Button 
                    variant="gradient" 
                    size="lg"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                  >
                    Create First Post
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          {blogs && blogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog: Blog, index: number) => (
                <div 
                  key={blog.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BlogPreviewCard
                    id={blog.id}
                    title={blog.title}
                    content={blog.content}
                    slug={blog.slug}
                    date={new Date(blog.created_at)}
                    likes={blog.like_count || 0}
                    dislikes={blog.dislike_count || 0}
                    author={blog.author_name}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </ClientOnly>
    </MainLayout>
  );
}