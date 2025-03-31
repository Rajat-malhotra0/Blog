import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Blog Admin</h1>
        </div>
        
        <nav className="mt-6">
          <a 
            href="/admin"
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="mr-3">📊</span>
            Dashboard
          </a>
          
          <a 
            href="/admin/posts"
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="mr-3">📄</span>
            Manage Posts
          </a>
          
          <a 
            href="/api/auth/logout"
            className="flex items-center px-6 py-3 mt-8 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="mr-3">🚪</span>
            Logout
          </a>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}