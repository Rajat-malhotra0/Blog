import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verify } from 'jsonwebtoken';

// Helper to verify admin permissions
function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    return false;
  }
  
  try {
    verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    return true;
  } catch (error) {
    return false;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin authentication
  const isAdmin = verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Delete the post
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete post' }, 
      { status: 500 }
    );
  }
}