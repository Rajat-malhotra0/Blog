export const dynamic = 'force-dynamic';

import React from 'react';
// Change this import
// import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin as supabase } from '@/lib/supabase/server-client'; // Use the server client!
import { Card } from '@/components/ui/Card'; // Assuming Card is client or shared

async function getStats() {
  console.log("getStats: Fetching admin dashboard data using SERVICE ROLE client..."); // Add logging

  // Use the imported 'supabase' which is now supabaseAdmin

  // Get post count
  // head: true makes it faster if you ONLY need the count
  const { count: postCount, error: postError } = await supabase
    .from('blogs') // Check table name case sensitivity
    .select('*', { count: 'exact', head: true });
  if (postError) console.error("getStats Error (postCount):", postError); // Log specific errors
  console.log("getStats: Raw Post Count:", postCount);

  // Get total likes, dislikes, and views
  // Select only the columns needed for aggregation
  const { data: interactions, error: interactionError } = await supabase
    .from('blogs') // Check table name
    .select('like_count, dislike_count, view_count'); // Check column names
  if (interactionError) console.error("getStats Error (interactions):", interactionError);
  console.log("getStats: Raw Interactions Data:", interactions); // Log raw data

  const totalLikes = interactions?.reduce((sum, blog) => sum + (blog.like_count || 0), 0) || 0;
  const totalDislikes = interactions?.reduce((sum, blog) => sum + (blog.dislike_count || 0), 0) || 0;
  const totalViews = interactions?.reduce((sum, blog) => sum + (blog.view_count || 0), 0) || 0;
  console.log(`getStats: Calculated Likes: ${totalLikes}, Dislikes: ${totalDislikes}, Views: ${totalViews}`);

  // Get most recent posts (Keep this limited)
  const { data: recentPosts, error: recentError } = await supabase
    .from('blogs')
    .select('*') // Select necessary fields: id, title, created_at, view_count, like_count, dislike_count
    .order('created_at', { ascending: false })
    .limit(5);
  if (recentError) console.error("getStats Error (recentPosts):", recentError);
  console.log("getStats: Raw Recent Posts:", recentPosts);

  // Get unique visitors count
  const { count: uniqueVisitors, error: visitorsError } = await supabase
    .from('visitors') // Check table name
    .select('*', { count: 'exact', head: true });
  if (visitorsError) console.error("getStats Error (uniqueVisitors):", visitorsError);
  console.log("getStats: Raw Unique Visitors Count:", uniqueVisitors);

  // Get traffic sources
  const { data: trafficSources, error: sourcesError } = await supabase
    .from('traffic_sources') // Check table name
    .select('source, count') // Check column names
    .order('count', { ascending: false })
    .limit(5);
  if (sourcesError) console.error("getStats Error (trafficSources):", sourcesError);
  console.log("getStats: Raw Traffic Sources:", trafficSources);

  // Get top performing content by views
  const { data: topContent, error: topContentError } = await supabase
    .from('blogs') // Check table name
    .select('id, title, view_count') // Check column names
    .order('view_count', { ascending: false })
    .limit(5);
  if (topContentError) console.error("getStats Error (topContent):", topContentError);
  console.log("getStats: Raw Top Content:", topContent);

  // Get daily view counts for the chart (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0); // Start from beginning of the day 7 days ago
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // To include today (total 7 days)
  console.log("getStats: Fetching daily views since:", sevenDaysAgo.toISOString());

  const { data: dailyViews, error: dailyViewsError } = await supabase
    .from('page_views') // Check table name
    .select('timestamp') // Check column name - ensure it's timestamp/timestamptz
    .gte('timestamp', sevenDaysAgo.toISOString());
  if (dailyViewsError) console.error("getStats Error (dailyViews):", dailyViewsError);
  console.log("getStats: Raw Daily Views Timestamps:", dailyViews);

  // --- Process daily views (Your logic seems okay, added check for data) ---
  const viewsByDay: Record<string, number> = {};
  const days = [];

  for (let i = 6; i >= 0; i--) { // Loop correctly to get last 7 days including today
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    viewsByDay[dateStr] = 0;
    days.push(dateStr);
  }

  if (dailyViews) { // Check if data exists before processing
    dailyViews.forEach(view => {
        if (view.timestamp) { // Ensure timestamp is not null
            try {
                const dateStr = new Date(view.timestamp).toISOString().split('T')[0];
                if (viewsByDay[dateStr] !== undefined) {
                viewsByDay[dateStr]++;
                }
            } catch (e) {
                console.error("Error processing timestamp:", view.timestamp, e)
            }
        }
    });
  }
  console.log("getStats: Processed Views By Day:", viewsByDay);

  const viewsData = days.map(day => ({
    date: day,
    views: viewsByDay[day]
  }));
  console.log("getStats: Final Chart Views Data:", viewsData);
  // --- End processing daily views ---


  const collectedErrors = [
    postError, interactionError, recentError, visitorsError, sourcesError, topContentError, dailyViewsError
  ].filter(Boolean); // Filter out null/undefined errors

  if (collectedErrors.length > 0) {
    console.warn("getStats: One or more Supabase errors occurred.", collectedErrors);
  }

  return {
    postCount: postCount || 0,
    totalLikes,
    totalDislikes,
    totalViews,
    uniqueVisitors: uniqueVisitors || 0,
    trafficSources: trafficSources || [],
    topContent: topContent || [],
    viewsData,
    recentPosts: recentPosts || [],
    // Pass the actual error objects if you want more details in the component,
    // or just indicate failure with a boolean/count
    errors: collectedErrors
  };
}

// ... the rest of your AdminDashboard component remains the same ...
export default async function AdminDashboard() {
  console.log("Rendering AdminDashboard Component...");
  const stats = await getStats();

  const {
    postCount,
    totalLikes,
    totalDislikes,
    totalViews,
    uniqueVisitors,
    trafficSources,
    topContent,
    viewsData,
    recentPosts,
    errors
  } = stats;

  console.log("AdminDashboard: Received stats:", stats);

  // Calculate additional metrics
  const engagementRate = totalViews ? ((totalLikes + totalDislikes) / totalViews * 100).toFixed(1) : '0.0';
  const avgViewsPerPost = postCount ? Math.round(totalViews / postCount) : 0;
  const conversionRate = uniqueVisitors ? ((totalLikes) / uniqueVisitors * 100).toFixed(1) : '0.0';
  const userSatisfaction = (totalLikes + totalDislikes > 0)
      ? Math.round((totalLikes / (totalLikes + totalDislikes)) * 100)
      : 0;

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg">
          <p className="font-semibold">Warning: Could not load all dashboard data.</p>
          <ul className="list-disc list-inside text-sm mt-1">
            {errors.map((err: any, index) => (
               <li key={index}>{err.message || 'An unknown error occurred'} (Hint: {err.hint})</li>
            ))}
          </ul>
          <p className="text-sm mt-1">Check server logs and ensure database tables/columns exist and RLS is bypassed (using SERVICE_ROLE_KEY).</p>
        </div>
      )}

      {/* Content Summary */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Content Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Total Posts</h3>
            <p className="text-4xl font-bold mt-2">{postCount}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Total Likes</h3>
            <p className="text-4xl font-bold mt-2 text-green-600 dark:text-green-400">{totalLikes}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Total Dislikes</h3>
            <p className="text-4xl font-bold mt-2 text-red-600 dark:text-red-400">{totalDislikes}</p>
          </Card>
        </div>
      </div>

      {/* Marketing Analytics Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Marketing Analytics</h2>
        
        {/* Digital Marketing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Total Views</h3>
            <p className="text-4xl font-bold mt-2">{totalViews.toLocaleString()}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Unique Visitors</h3>
            <p className="text-4xl font-bold mt-2">{uniqueVisitors?.toLocaleString() || 0}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Engagement Rate</h3>
            <p className="text-4xl font-bold mt-2">{engagementRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Interactions per view</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Avg. Views Per Post</h3>
            <p className="text-4xl font-bold mt-2">{avgViewsPerPost}</p>
          </Card>
        </div>
        
        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Conversion Rate</h3>
            <p className="text-4xl font-bold mt-2">{conversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Likes per unique visitor</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">User Satisfaction</h3>
            <p className="text-4xl font-bold mt-2">{userSatisfaction}%</p>
            <p className="text-xs text-gray-500 mt-1">Likes vs total reactions</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg text-gray-500 dark:text-gray-400">Views Today</h3>
            <p className="text-4xl font-bold mt-2">{viewsData.length > 0 ? viewsData[viewsData.length - 1]?.views : 0}</p>
          </Card>
        </div>
        
        {/* Views over time chart */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6">Views (Last 7 Days)</h3>
          <div className="h-64 w-full">
            <div className="h-full flex items-end justify-between">
              {viewsData.map((day, i) => {
                // Calculate maximum value for scaling
                const maxViews = Math.max(...viewsData.map(d => d.views), 1);
                const percentage = Math.max((day.views / maxViews) * 90, 5);
                
                return (
                  <div key={i} className="flex flex-col items-center w-1/8">
                    <div 
                      className="bg-blue-500 rounded-t-sm w-14" 
                      style={{ height: `${percentage}%` }}
                    ></div>
                    <p className="text-xs mt-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xs text-gray-500">{day.views}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        
        {/* Traffic Sources and Top Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Traffic Sources</h3>
            {trafficSources && trafficSources.length > 0 ? (
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{source.source || 'Direct'}</span>
                    <span className="text-gray-600 dark:text-gray-400">{source.count} visitors</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No traffic source data available yet</p>
                <p className="text-sm mt-2">Traffic sources will appear once your blog receives visitors from different referrers.</p>
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Top Performing Content</h3>
            {topContent && topContent.length > 0 ? (
              <div className="space-y-4">
                {topContent.map((post) => (
                  <div key={post.id} className="flex justify-between items-center">
                    <span className="font-medium truncate max-w-[70%]">{post.title}</span>
                    <span className="text-gray-600 dark:text-gray-400">{post.view_count || 0} views</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No content performance data available yet</p>
                <p className="text-sm mt-2">This section will display your most viewed content once your blog starts receiving views.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Recent Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
        {recentPosts && recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Card key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150">
                <h3 className="font-medium">{post.title}</h3>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-4">
                    <span title="Views">👁️ {post.view_count || 0}</span>
                    <span title="Likes">👍 {post.like_count || 0}</span>
                    <span title="Dislikes">👎 {post.dislike_count || 0}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No posts available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
