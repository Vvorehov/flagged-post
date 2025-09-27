export interface Post {
  id: number;
  platform: string;
  text: string;
  status: string;
  tags: string[];
  created_at: string;
}

export type PostStatus = 'flagged' | 'under_review' | 'dismissed';