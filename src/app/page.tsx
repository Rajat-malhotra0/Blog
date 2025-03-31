import React from 'react';
import { supabase } from '@/lib/supabase/client';
import ClientOnly from '@/components/ClientOnly';
import MainLayout from '@/components/layout/MainLayout';
import { BlogPreviewCard } from '@/components/blog/BlogPreviewCard'; // Changed import
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Blog } from '@/lib/types';

export default async function Home() {
  // Fetch blogs directly in the server component
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <MainLayout>
      <ClientOnly>
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Recent Posts</h1>
          <Link href="/create">
            <Button>Write a Post</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md mb-6">
            Failed to load blog posts. Please try again later.
          </div>
        )}

        {blogs && blogs.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No blog posts yet!</h2>
            <p className="mb-6">Be the first one to share your thoughts anonymously.</p>
            <Link href="/create">
              <Button size="lg">Create First Post</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs?.map((blog: Blog) => (
            <BlogPreviewCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              content={blog.content}
              slug={blog.slug}
              date={new Date(blog.created_at)}
              likes={blog.like_count || 0}
              dislikes={blog.dislike_count || 0}
              author={blog.author_name}
            />
          ))}
        </div>
      </ClientOnly>
    </MainLayout>
  );
}