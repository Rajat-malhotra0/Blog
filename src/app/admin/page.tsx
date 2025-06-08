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
    <div className="min-h-screen bg-background dark:bg-background-dark">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 border-b border-border/30 dark:border-border-dark/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your blog and monitor analytics</p>
              </div>
            </div>
            
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                <div className="text-2xl font-bold text-foreground">{postCount}</div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalLikes}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{uniqueVisitors?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Unique Visitors</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {errors.length > 0 && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-2xl shadow-lg animate-shake">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-lg">Warning: Could not load all dashboard data</p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  {errors.map((err: any, index) => (
                     <li key={index}>{err.message || 'An unknown error occurred'} (Hint: {err.hint})</li>
                  ))}
                </ul>
                <p className="text-sm mt-3 text-red-600 dark:text-red-400">Check server logs and ensure database tables/columns exist and RLS is bypassed (using SERVICE_ROLE_KEY).</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Summary */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>Content Summary</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="p-8 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-muted-foreground">Total Posts</h3>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold gradient-text">{postCount}</p>
            </Card>
            
            <Card variant="glass" className="p-8 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-muted-foreground">Total Likes</h3>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{totalLikes}</p>
            </Card>
            
            <Card variant="glass" className="p-8 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-muted-foreground">Total Dislikes</h3>
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">{totalDislikes}</p>
            </Card>
          </div>
        </div>

        {/* Marketing Analytics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span>Marketing Analytics</span>
          </h2>
          
          {/* Digital Marketing Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card variant="glass" className="p-6 group">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Views</h3>
              <p className="text-3xl font-bold gradient-text">{totalViews.toLocaleString()}</p>
            </Card>
            
            <Card variant="glass" className="p-6 group">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Unique Visitors</h3>
              <p className="text-3xl font-bold gradient-text">{uniqueVisitors?.toLocaleString() || 0}</p>
            </Card>
            
            <Card variant="glass" className="p-6 group">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Engagement Rate</h3>
              <p className="text-3xl font-bold gradient-text">{engagementRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Interactions per view</p>
            </Card>
            
            <Card variant="glass" className="p-6 group">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Avg. Views Per Post</h3>
              <p className="text-3xl font-bold gradient-text">{avgViewsPerPost}</p>
            </Card>
          </div>
          
          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card variant="glass" className="p-6 group">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Conversion Rate</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Likes per unique visitor</p>
            </Card>
            
            <Card variant="glass" className="p-6 group">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">User Satisfaction</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{userSatisfaction}%</p>
              <p className="text-xs text-muted-foreground mt-1">Likes vs total reactions</p>
            </Card>
            
            <Card variant="glass" className="p-6 group">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Views Today</h3>
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
