import { Post, PostFilters, PostStatus, PaginatedResponse } from './types';
import fs from 'fs';
import path from 'path';

class PostService {
  private posts: Post[] = [];
  private readonly dataPath = path.join(__dirname, '../mock-posts.json');

  constructor() {
    this.loadPosts();
  }

  private loadPosts(): void {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      this.posts = JSON.parse(data);
      console.log(`Loaded ${this.posts.length} posts from mock-posts.json`);
    } catch (error) {
      console.error('Error loading posts:', error);
      this.posts = [];
    }
  }

  private applyFilters(posts: Post[], filters: PostFilters = {}): Post[] {
    let filteredPosts = [...posts];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.status === filters.status);
    }

    // Filter by platform
    if (filters.platform && filters.platform !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.platform === filters.platform);
    }

    // Filter by tag
    if (filters.tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))
      );
    }

    // Filter by text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.text.toLowerCase().includes(searchTerm) ||
        post.platform.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filteredPosts;
  }

  public getFilteredPosts(filters: PostFilters = {}): Post[] {
    return this.applyFilters(this.posts, filters);
  }

  public getAllPosts(filters: PostFilters = {}): PaginatedResponse<Post> {
    const filteredPosts = this.applyFilters(this.posts, filters);

    const limit = filters.limit || filteredPosts.length;
    const offset = filters.offset || 0;
    const totalCount = filteredPosts.length;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return {
      data: paginatedPosts,
      totalCount,
      currentPage,
      totalPages,
      limit,
      offset
    };
  }

  public getPostById(id: number): Post | null {
    return this.posts.find(post => post.id === id) || null;
  }

  public updatePostStatus(id: number, status: PostStatus): Post | null {
    const postIndex = this.posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return null;
    }

    this.posts[postIndex].status = status;
    return this.posts[postIndex];
  }

  public addTagToPost(id: number, tag: string): Post | null {
    const postIndex = this.posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return null;
    }

    const post = this.posts[postIndex];
    if (!post.tags.includes(tag)) {
      post.tags.push(tag);
    }
    
    return post;
  }

  public removeTagFromPost(id: number, tag: string): Post | null {
    const postIndex = this.posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return null;
    }

    const post = this.posts[postIndex];
    post.tags = post.tags.filter(t => t !== tag);
    
    return post;
  }

  public getUniquePlatforms(): string[] {
    return [...new Set(this.posts.map(post => post.platform))].sort();
  }

  public getUniqueTags(): string[] {
    const allTags = this.posts.flatMap(post => post.tags);
    return [...new Set(allTags)].sort();
  }


}

export default PostService;