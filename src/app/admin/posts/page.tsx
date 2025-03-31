export const dynamic = 'force-dynamic';


import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import DeletePostButton from './DeletePostButton';

async function getPosts() {
  const { data: posts, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching posts:', error);
  }
  
  return posts || [];
}

export default async function AdminPosts() {
  const posts = await getPosts();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Posts</h1>
        <Link href="/admin/posts/new">
          <Button>Create New Post</Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Likes/Dislikes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.author_name || 'Anonymous'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>👍 {post.like_count || 0}</span>
                    <span>👎 {post.dislike_count || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <Link 
                      href={`/admin/posts/edit/${post.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    >
                      View
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </td>
              </tr>
            ))}
            
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No posts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}