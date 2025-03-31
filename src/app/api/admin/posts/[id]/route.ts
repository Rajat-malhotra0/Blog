import { NextRequest, NextResponse } from 'next/server';
// IMPORTANT: Ensure this imports a Supabase client initialized with the SERVICE_ROLE_KEY
// Maybe rename the import if you create a specific server client file
import { supabaseAdmin as supabase } from '@/lib/supabase/server-client'; // ADJUST THIS IMPORT
import { jwtVerify } from 'jose';

// Helper function to get JWT secret (recommended)
function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Log critical error, don't fallback in production ideally
    console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
    throw new Error('JWT_SECRET is not set.'); 
  }
  return new TextEncoder().encode(secret);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // ID comes from the route segment [id]
) {
  const { id } = context.params;
  console.log(`DELETE /api/blogs/${id} called`);

  if (!id) {
      console.error("API Error: No ID provided in the URL path.");
      return NextResponse.json({ error: 'Blog post ID is required.' }, { status: 400 });
  }

  // 1. Authentication Check
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    console.warn(`Unauthorized DELETE attempt for ID: ${id} - No token.`);
    return NextResponse.json({ error: 'Unauthorized: Missing authentication token.' }, { status: 401 });
  }

  try {
    const secretKey = getJwtSecretKey(); // Get secret safely
    await jwtVerify(token, secretKey);
    console.log(`Authentication successful for DELETE /api/blogs/${id}`);
  } catch (error) {
    console.warn(`Invalid token for DELETE /api/blogs/${id}:`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
  }

  // 2. Database Operation (using SERVICE ROLE client)
  try {
    console.log(`Attempting to delete blog post with ID: ${id} using admin client.`);

    // ---> Check the type of your 'id' column in Supabase <---
    // If it's numeric (int, bigint), uncomment and use this:
    /*
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`Invalid numeric ID format received: ${id}`);
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    const { error: deleteError } = await supabase
      .from('blogs')
      .delete()
      .eq('id', numericId); // Use numeric ID here
    */

    // If 'id' is UUID or TEXT (most common), use this:
    const { error: deleteError } = await supabase
      .from('blogs') // Ensure 'blogs' is your correct table name
      .delete()
      .eq('id', id); // Ensure 'id' is the correct column name

    // 3. Handle Supabase Response
    if (deleteError) {
      // Log the detailed error server-side
      console.error(`Supabase delete error for ID ${id}:`, deleteError);

      // Provide a more generic error to the client
      return NextResponse.json(
        { 
            error: 'Failed to delete post due to database issue.',
            // Optionally include non-sensitive details for client debugging
            details: deleteError.message 
        }, 
        { status: 500 } // Internal Server Error
      );
    }

    // --- IMPORTANT: Check if anything was actually deleted ---
    // Supabase delete doesn't return the deleted data by default, and might not error
    // if the ID simply doesn't exist. If you need confirmation it *was* found and deleted,
    // you might need a different approach (like select then delete, or check `count` if available).
    // For now, we assume success if no error occurred.

    console.log(`Successfully initiated delete for blog post with ID: ${id}`);

    // 4. Return Success Response
    const response = NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      deletedId: id,
    });

    // Add cache control headers to prevent caching of the response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache'); // Older browsers
    response.headers.set('Expires', '0'); // Proxies

    return response;

  } catch (error: any) {
    // Catch unexpected errors (e.g., issues getting JWT secret, network errors)
    console.error(`Unexpected error during DELETE /api/blogs/${id}:`, error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}