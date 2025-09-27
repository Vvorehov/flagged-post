import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PostStatus, UpdateStatusRequest, AddTagRequest, ApiResponse, PostFilters } from './types';
import PostService from './postService';

const app = express();
const PORT = process.env.PORT || 5000;

const postService = new PostService();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API-only server
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vvorehov.github.io'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const createResponse = <T>(success: boolean, data?: T, message?: string): ApiResponse<T> => ({
  success,
  data,
  message
});

const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => 
  createResponse(true, data, message);

const createErrorResponse = (message: string): ApiResponse<null> => 
  createResponse(false, null, message);

const parseFilters = (query: any): PostFilters => {
  const limit = parseInt(query.limit) || 10;
  const offset = parseInt(query.offset) || 0;
  
  return {
    search: query.search?.toString(),
    status: query.status as PostStatus,
    platform: query.platform?.toString(),
    tag: query.tag?.toString(),
    limit: Math.min(limit, 50),
    offset
  };
};

app.get('/posts', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);

    // If the request has a large limit or no limit - return a simple array
    if (!filters.limit || filters.limit >= 50) {
      const posts = postService.getFilteredPosts(filters);
      res.json(createSuccessResponse({
        data: posts,
        totalCount: posts.length
      }));
    } else {
      // Else use pagination
      const result = postService.getAllPosts(filters);
      
      const hasMore = result.currentPage < result.totalPages;
      const nextCursor = hasMore ? (result.offset + result.limit) : null;
      
      res.json(createSuccessResponse({
        ...result,
        hasMore,
        nextCursor
      }));
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json(createErrorResponse('Failed to fetch posts'));
  }
});

app.get('/posts/:id', (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json(createErrorResponse('Invalid post ID'));
    }

    const post = postService.getPostById(postId);
    
    if (!post) {
      return res.status(404).json(createErrorResponse('Post not found'));
    }

    res.json(createSuccessResponse(post));
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json(createErrorResponse('Internal server error'));
  }
});

app.patch('/posts/:id/status', (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { status }: UpdateStatusRequest = req.body;

    if (isNaN(postId)) {
      return res.status(400).json(createErrorResponse('Invalid post ID'));
    }

    const validStatuses: PostStatus[] = ['FLAGGED', 'UNDER_REVIEW', 'DISMISSED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json(createErrorResponse('Invalid status. Must be one of: FLAGGED, UNDER_REVIEW, DISMISSED'));
    }

    const updatedPost = postService.updatePostStatus(postId, status);
    
    if (!updatedPost) {
      return res.status(404).json(createErrorResponse('Post not found'));
    }

    res.json(createSuccessResponse(updatedPost, 'Post status updated successfully'));
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json(createErrorResponse('Internal server error'));
  }
});

app.post('/posts/:id/tags', (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { tag }: AddTagRequest = req.body;

    if (isNaN(postId)) {
      return res.status(400).json(createErrorResponse('Invalid post ID'));
    }

    if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
      return res.status(400).json(createErrorResponse('Tag is required and must be a non-empty string'));
    }

    const updatedPost = postService.addTagToPost(postId, tag.trim());
    
    if (!updatedPost) {
      return res.status(404).json(createErrorResponse('Post not found'));
    }

    res.json(createSuccessResponse(updatedPost, 'Tag added successfully'));
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json(createErrorResponse('Internal server error'));
  }
});

app.delete('/posts/:id/tags/:tag', (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const tag = req.params.tag;

    if (isNaN(postId)) {
      return res.status(400).json(createErrorResponse('Invalid post ID'));
    }

    if (!tag) {
      return res.status(400).json(createErrorResponse('Tag is required'));
    }

    const updatedPost = postService.removeTagFromPost(postId, decodeURIComponent(tag));
    
    if (!updatedPost) {
      return res.status(404).json(createErrorResponse('Post not found'));
    }

    res.json(createSuccessResponse(updatedPost, 'Tag removed successfully'));
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json(createErrorResponse('Internal server error'));
  }
});

app.get('/platforms', (req: Request, res: Response) => {
  try {
    const platforms = postService.getUniquePlatforms();
    res.json(createSuccessResponse(platforms));
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json(createErrorResponse('Internal server error'));
  }
});

app.get('/tags', (req: Request, res: Response) => {
  try {
    const tags = postService.getUniqueTags();
    res.json(createSuccessResponse(tags));
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json(createErrorResponse('Internal server error'));
  }
});

// Root endpoint - API documentation
app.get('/', (req: Request, res: Response) => {
  res.json(createSuccessResponse({
    name: 'Flagged Posts Review Tool API',
    version: '1.0.0',
    description: 'API for managing flagged social media posts',
    endpoints: {
      'GET /': 'API documentation',
      'GET /health': 'Health check',
      'GET /posts': 'Get posts with optional filtering and pagination',
      'GET /posts/:id': 'Get specific post by ID',
      'PATCH /posts/:id/status': 'Update post status (PENDING/IN_REVIEW/APPROVED/REJECTED)',
      'POST /posts/:id/tags': 'Add tag to post',
      'DELETE /posts/:id/tags/:tag': 'Remove tag from post',
      'GET /platforms': 'Get available platforms',
      'GET /tags': 'Get all tags'
    },
    examples: {
      'Get all posts': '/posts?limit=20',
      'Filter by platform': '/posts?platform=twitter',
      'Filter by status': '/posts?status=PENDING',
      'Search posts': '/posts?search=health',
      'Update status': 'PATCH /posts/1/status {"status": "APPROVED"}',
      'Add tag': 'POST /posts/1/tags {"tag": "urgent"}',
      'Remove tag': 'DELETE /posts/1/tags/urgent'
    }
  }));
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json(createSuccessResponse({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  }));
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json(createErrorResponse('Route not found'));
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json(createErrorResponse('Internal server error'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;