export interface Blog {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at?: string;
  author_name?: string; // Make this optional since some posts might be anonymous
  like_count: number;
  dislike_count: number;
}
  
  export type Interaction = {
    id: string;
    blog_id: string;
    anonymous_user_id: string;
    interaction_type: 'like' | 'dislike';
    created_at: string;
  };
  
  export type TrafficLog = {
    id: string;
    path: string;
    timestamp: string;
    user_agent?: string;
    anonymous_user_id?: string;
    referrer?: string;
  };