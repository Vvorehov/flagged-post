import React from "react";

interface FiltersProps {
  search: string;
  setSearch: (value: string) => void;
  platform: string;
  setPlatform: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  tag: string;
  setTag: (value: string) => void;
  allPlatforms: string[];
  allTags: string[];
  onClear: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  search,
  setSearch,
  platform,
  setPlatform,
  status,
  setStatus,
  tag,
  setTag,
  allPlatforms,
  allTags,
  onClear
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <input
          name="search"
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        
        <select
          name="platform"
          value={platform} 
          onChange={(e) => setPlatform(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Platforms</option>
          {allPlatforms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Status</option>
          <option value="flagged">Flagged</option>
          <option value="under_review">Under Review</option>
          <option value="dismissed">Dismissed</option>
        </select>
        
        <select
          name="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Tags</option>
          {allTags.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        
        <button
          onClick={onClear}
          className="bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Filters;