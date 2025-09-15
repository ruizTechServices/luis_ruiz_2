export interface BlogPost {
  id: number;
  created_at: string;
  title: string | null;
  summary: string | null;
  tags: string | null;        // CSV string for now
  references: string | null;
  body: string | null;
}

export interface Comment {
  id: number;
  post_id: number;
  user_email: string;
  content: string;
  created_at: string;
}

export type VoteType = 'up' | 'down';

export interface Vote {
  id: number;
  post_id: number;
  user_email: string;
  vote_type: VoteType | null;
  created_at: string;
}
