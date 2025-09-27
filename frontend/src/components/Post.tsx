import React from 'react';
import type { Post } from '../types';

interface PostProps {
  post: Post;
  editingTag: number | null;
  newTagValue: string;
  onUpdateStatus: (postId: number, newStatus: string) => void;
  onRemoveTag: (postId: number, tagName: string) => void;
  onAddTag: (postId: number, tagName: string) => void;
  onStartEditingTag: (postId: number) => void;
  onCancelEditingTag: () => void;
  onTagValueChange: (value: string) => void;
  onTagSubmit: (postId: number, e: React.KeyboardEvent) => void;
}

const PostComponent: React.FC<PostProps> = ({
  post,
  editingTag,
  newTagValue,
  onUpdateStatus,
  onRemoveTag,
  onAddTag,
  onStartEditingTag,
  onCancelEditingTag,
  onTagValueChange,
  onTagSubmit
}) => {
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">{post.platform}</td>
      <td className="p-3 max-w-xs">{post.text}</td>
      <td className="p-3">
        <select
          name="current-status"
          value={post.status}
          onChange={(e) => onUpdateStatus(post.id, e.target.value)}
          className="border p-1 rounded text-sm"
        >
          <option value="flagged">Flagged</option>
          <option value="under_review">Under Review</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tagName => (
            <span 
              key={tagName}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center"
            >
              {tagName}
              <button 
                onClick={() => onRemoveTag(post.id, tagName)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
          {editingTag === post.id ? (
            <div className="inline-flex items-center">
              <input
                type="text"
                value={newTagValue}
                onChange={(e) => onTagValueChange(e.target.value)}
                onKeyDown={(e) => onTagSubmit(post.id, e)}
                onBlur={() => {
                  if (newTagValue.trim()) {
                    onAddTag(post.id, newTagValue);
                  } else {
                    onCancelEditingTag();
                  }
                }}
                placeholder="Tag name..."
                autoFocus
                className="w-20 px-2 py-1 text-xs border border-blue-300 rounded"
              />
              <button
                onClick={() => onAddTag(post.id, newTagValue)}
                className="ml-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                ✓
              </button>
              <button
                onClick={onCancelEditingTag}
                className="ml-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onStartEditingTag(post.id)}
              className="inline-flex items-center px-2 py-1 text-blue-700 text-xs rounded border border-dashed border-blue-300"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Tag
            </button>
          )}
        </div>
      </td>
      <td className="p-3 text-sm text-gray-600">
        {new Date(post.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default PostComponent;