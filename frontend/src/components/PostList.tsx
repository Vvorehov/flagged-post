import React, { useState, useEffect } from 'react';
import Filters from './Filters';
import PostComponent from './Post';
import type { Post } from '../types';

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState('all');
  const [tag, setTag] = useState('all');
  const [allPlatforms, setAllPlatforms] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [newTagValue, setNewTagValue] = useState('');

  const handleClearFilters = () => {
    setSearch('');
    setPlatform('all');
    setStatus('all');
    setTag('all');
  };

  const handleStartEditingTag = (postId: number) => {
    setEditingTag(postId);
    setNewTagValue('');
  };

  const handleCancelEditingTag = () => {
    setEditingTag(null);
    setNewTagValue('');
  };

  const loadAllOptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/posts');
      const result = await response.json();
      
      if (result.success) {
        const posts = result.data.data || result.data;
        const platforms = Array.from(new Set(posts.map((post: Post) => post.platform))).sort() as string[];
        const tags = Array.from(new Set(posts.flatMap((post: Post) => post.tags || []))).sort() as string[];

        setAllPlatforms(platforms);
        setAllTags(tags);
      }
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', '50');
      
      if (search) params.append('search', search);
      if (platform !== 'all') params.append('platform', platform);
      if (status !== 'all') params.append('status', status.toUpperCase());
      if (tag !== 'all') params.append('tag', tag);

      const response = await fetch(`http://localhost:5000/posts?${params}`);
      const result = await response.json();
      
      if (result.success) {
        const postsData = result.data.data || result.data;
        const formattedPosts = postsData.map((post: Post) => ({
          id: post.id,
          platform: post.platform,
          text: post.text,
          status: post.status.toLowerCase(),
          tags: post.tags || [],
          created_at: post.created_at
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (postId: number, newStatus: string) => {
    try {
      await fetch(`http://localhost:5000/posts/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, status: newStatus.toLowerCase() }
            : post
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const addTag = async (postId: number, newTag: string) => {
    if (!newTag.trim()) return;
    try {
      await fetch(`http://localhost:5000/posts/${postId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag.trim() })
      });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, tags: [...post.tags, newTag.trim()] }
            : post
        )
      );
      
      if (!allTags.includes(newTag.trim())) {
        setAllTags(prevTags => [...prevTags, newTag.trim()].sort());
      }
      
      setEditingTag(null);
      setNewTagValue('');
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleTagSubmit = (postId: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag(postId, newTagValue);
    } else if (e.key === 'Escape') {
      setEditingTag(null);
      setNewTagValue('');
    }
  };

  const removeTag = async (postId: number, tagToRemove: string) => {
    try {
      await fetch(`http://localhost:5000/posts/${postId}/tags/${encodeURIComponent(tagToRemove)}`, {
        method: 'DELETE'
      });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, tags: post.tags.filter(tag => tag !== tagToRemove) }
            : post
        )
      );
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  useEffect(() => {
    loadAllOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, platform, status, tag]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Flagged Posts Review Tool</h1>
      
      <Filters
        search={search}
        setSearch={setSearch}
        platform={platform}
        setPlatform={setPlatform}
        status={status}
        setStatus={setStatus}
        tag={tag}
        setTag={setTag}
        allPlatforms={allPlatforms}
        allTags={allTags}
        onClear={handleClearFilters}
      />

      {loading && <p>Loading...</p>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Platform</th>
              <th className="p-3 text-left">Content</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Tags</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <PostComponent
                key={post.id}
                post={post}
                editingTag={editingTag}
                newTagValue={newTagValue}
                onUpdateStatus={updateStatus}
                onRemoveTag={removeTag}
                onAddTag={addTag}
                onStartEditingTag={handleStartEditingTag}
                onCancelEditingTag={handleCancelEditingTag}
                onTagValueChange={setNewTagValue}
                onTagSubmit={handleTagSubmit}
              />
            ))}
          </tbody>
        </table>

        {posts.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            No posts found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
