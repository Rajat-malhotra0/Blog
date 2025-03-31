import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server-client'; // Import server client for updates
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import BlogPostClient from './client';
import { cookies } from 'next/headers';

type Params = {
  params: {
    slug: string;
  };
};

export default async function BlogPost({ params }: Params) {
  const { slug } = params;

  // Fetch blog post by slug
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !blog) {
    notFound();
  }

  // Track the view (using a server function)
  await trackPageView(blog.id);

  return (
    <MainLayout>
      <Card className="max-w-3xl mx-auto">
        <BlogPostClient blog={blog} />
      </Card>
    </MainLayout>
  );
}

// Function to track page views
// Function to track page views
async function trackPageView(blogId: string) {
  try {
    // Get visitor identifier
    const cookieStore = await cookies();
    let visitorId = cookieStore.get('visitor_id')?.value;
    
    if (!visitorId) {
      console.log('New visitor detected');
    }

    // Directly increment the view count without RPC
    // 1. First get the current count
    const { data: currentBlog, error: fetchError } = await supabaseAdmin
      .from('blogs')
      .select('view_count')
      .eq('id', blogId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching blog view count:', fetchError);
      return;
    }
    
    // 2. Increment and update
    const newCount = (currentBlog.view_count || 0) + 1;
    const { error: updateError } = await supabaseAdmin
      .from('blogs')
      .update({ view_count: newCount })
      .eq('id', blogId);
    
    if (updateError) {
      console.error('Error updating view count:', updateError);
    } else {
      console.log(`View count updated to ${newCount} for blog ID: ${blogId}`);
    }

    // 3. Record the page view in the page_views table
    const { error: insertError } = await supabaseAdmin
      .from('page_views')
      .insert({
        page_id: blogId,
        visitor_id: visitorId || null,
        timestamp: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording page view:', insertError);
    }

    console.log(`Page view tracked for blog ID: ${blogId}`);
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}