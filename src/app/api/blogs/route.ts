import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { nanoid } from 'nanoid';

// GET handler to list all blogs
export async function GET(request: NextRequest) {
  try {
    // Get query parameters (for pagination or filtering)
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    // Query blogs with pagination
    const { data: blogs, error, count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching blogs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blogs' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      blogs,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST handler to create a new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author_name } = body;
    
    // Validate input
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Generate slug from title
    let baseSlug = slugify(title);
    let slug = baseSlug;
    
    // Check if slug already exists and make it unique if needed
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('slug')
      .eq('slug', slug)
      .single();
      
    if (existingBlog) {
      // If slug exists, append a short unique ID
      slug = `${baseSlug}-${nanoid(6)}`;
    }
    
    // Insert new blog post
    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert([
        {
          title,
          content,
          slug,
          author_name: author_name || null,
          like_count: 0,
          dislike_count: 0
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating blog:', error);
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}