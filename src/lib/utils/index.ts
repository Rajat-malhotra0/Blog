import { NextRequest } from 'next/server';
import crypto from 'crypto';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Generates a URL-friendly slug from a title
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove non-word chars
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Basic HTML sanitization to prevent XSS attacks
 * Note: For production, consider using a more robust library like dompurify
 */
export function sanitizeContent(content: string): string {
  // This is a simplified sanitization approach
  // Replace < and > with their HTML entities to prevent script execution
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Generates an anonymous ID for a user based on their request characteristics
 */
export function generateAnonymousId(request: NextRequest): string {
  // NextRequest doesn't have direct IP access, so we'll use headers
  const forwardedFor = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const ip = forwardedFor.split(',')[0].trim();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a hash of IP + User-Agent
  return crypto
    .createHash('sha256')
    .update(`${ip}-${userAgent}`)
    .digest('hex');
}

/**
 * For client-side anonymous ID generation
 * Uses sessionStorage or falls back to a random ID
 */
export function getClientAnonymousId(): string {
  const storedId = localStorage.getItem('client_anonymous_id');
  if (storedId) return storedId;
  
  // Generate a new ID (for example, using Date.now() or any other generator)
  const newId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('client_anonymous_id', newId);
  return newId;
}

export function unescapeHTML(escapedHTML: string): string {
  return escapedHTML
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/&/g, '-and-')          // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')             // Trim hyphens from start
    .replace(/-+$/, '');            // Trim hyphens from end
}