export interface Post {
  id: number;
  platform: string;
  text: string;
  status: PostStatus;
  tags: string[];
  created_at: string;
}

export type PostStatus = 'FLAGGED' | 'UNDER_REVIEW' | 'DISMISSED';

export interface PostFilters {
  status?: PostStatus | 'all';
  platform?: string | 'all';
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  offset: number;
  hasMore?: boolean;
  nextCursor?: number | null;
}

export interface UpdateStatusRequest {
  status: PostStatus;
}

export interface AddTagRequest {
  tag: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}