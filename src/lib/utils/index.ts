import slugify from 'slugify';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';

// Generate a slug from title
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
  });
}

// Sanitize HTML content to prevent XSS attacks
export function sanitizeContent(content: string): string {
  if (typeof window === 'undefined') {
    return content; // Return as-is if running on server (DOMPurify is browser-only)
  }
  return DOMPurify.sanitize(content);
}

// Generate anonymous user ID from IP and user agent
export function generateAnonymousId(req: Request): string {
  const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
  const userAgent = req.headers.get('user-agent') || 'unknown-ua';
  
  // In a real app, you'd want to hash this with a secret
  return btoa(`${ip}-${userAgent}`);
}

// For client-side use (localStorage based approach)
export function getClientAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  
  // Fix the null handling
  const anonId = localStorage.getItem('anonymous_id');
  if (!anonId) {
    const newId = uuidv4();
    localStorage.setItem('anonymous_id', newId);
    return newId;
  }
  return anonId;
}