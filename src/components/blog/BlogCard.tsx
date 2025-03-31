import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Blog } from '@/lib/types';
import BlogInteractions from './BlogInteractions';

type BlogCardProps = {
  blog: Blog;
};

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/blog/${blog.slug}`}>
        <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
      </Link>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {blog.content.length > 150
          ? `${blog.content.substring(0, 150)}...`
          : blog.content}
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {new Date(blog.created_at).toLocaleDateString()}
      </div>
      <BlogInteractions blog={blog} />
    </Card>
  );
}