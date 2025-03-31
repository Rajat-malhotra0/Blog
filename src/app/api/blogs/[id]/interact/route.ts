import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = params.id;
    
    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { interaction_type, anonymous_user_id } = body;
    
    if (!interaction_type || !anonymous_user_id) {
      return NextResponse.json(
        { error: 'interaction_type and anonymous_user_id are required' },
        { status: 400 }
      );
    }
    
    // Check if user has already interacted with this blog
    const { data: existingInteraction, error: fetchError } = await supabaseAdmin
      .from('blog_interactions')
      .select('*')
      .eq('blog_id', blogId)
      .eq('anonymous_user_id', anonymous_user_id)
      .single();
    
    // Determine which counter to update
    let incrementLikes = 0;
    let incrementDislikes = 0;
    
    if (existingInteraction) {
      // User already interacted, check if changing interaction type
      if (existingInteraction.interaction_type === interaction_type) {
        // Same interaction, do nothing
        return NextResponse.json({
          message: 'Already interacted with this post',
          like_count: existingInteraction.like_count,
          dislike_count: existingInteraction.dislike_count
        });
      } else {
        // Changing interaction type
        // If previous was like and new is dislike
        if (existingInteraction.interaction_type === 'like' && interaction_type === 'dislike') {
          incrementLikes = -1;
          incrementDislikes = 1;
        } 
        // If previous was dislike and new is like
        else if (existingInteraction.interaction_type === 'dislike' && interaction_type === 'like') {
          incrementLikes = 1;
          incrementDislikes = -1;
        }
        
        // Update the interaction record
        const { error: updateInteractionError } = await supabaseAdmin
          .from('blog_interactions')
          .update({ interaction_type })
          .eq('id', existingInteraction.id);
          
        if (updateInteractionError) {
          console.error('Error updating interaction:', updateInteractionError);
          return NextResponse.json(
            { error: 'Failed to update interaction' },
            { status: 500 }
          );
        }
      }
    } else {
      // No existing interaction, create new one
      if (interaction_type === 'like') {
        incrementLikes = 1;
      } else if (interaction_type === 'dislike') {
        incrementDislikes = 1;
      }
      
      // Record the interaction
      const { error: insertError } = await supabaseAdmin
        .from('blog_interactions')
        .insert({
          blog_id: blogId,
          anonymous_user_id,
          interaction_type
        });
        
      if (insertError) {
        console.error('Error recording interaction:', insertError);
        return NextResponse.json(
          { error: 'Failed to record interaction' },
          { status: 500 }
        );
      }
    }
    
    // Update the blog counters
    // First, get current counts
    const { data: blogData, error: blogFetchError } = await supabaseAdmin
      .from('blogs')
      .select('like_count, dislike_count')
      .eq('id', blogId)
      .single();
      
    if (blogFetchError) {
      console.error('Error fetching blog:', blogFetchError);
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Calculate new counts
    const newLikeCount = (blogData.like_count || 0) + incrementLikes;
    const newDislikeCount = (blogData.dislike_count || 0) + incrementDislikes;
    
    // Update the blog
    const { error: updateError } = await supabaseAdmin
      .from('blogs')
      .update({
        like_count: newLikeCount,
        dislike_count: newDislikeCount
      })
      .eq('id', blogId);
      
    if (updateError) {
      console.error('Error updating blog counts:', updateError);
      return NextResponse.json(
        { error: 'Failed to update blog counts' },
        { status: 500 }
      );
    }
    
    // Return the updated counts
    return NextResponse.json({
      message: 'Interaction recorded successfully',
      like_count: newLikeCount,
      dislike_count: newDislikeCount
    });
    
  } catch (error: any) {
    console.error('Error processing interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}