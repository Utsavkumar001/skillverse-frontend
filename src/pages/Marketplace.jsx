import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['all', 'learning', 'coding', 'career', 'research', 'productivity', 'creative'];

const CATEGORY_COLORS = {
  learning: 'bg-blue-50 text-blue-700 border-blue-100',
  coding: 'bg-purple-50 text-purple-700 border-purple-100',
  career: 'bg-green-50 text-green-700 border-green-100',
  research: 'bg-amber-50 text-amber-700 border-amber-100',
  productivity: 'bg-teal-50 text-teal-700 border-teal-100',
  creative: 'bg-pink-50 text-pink-700 border-pink-100',
};

const CATEGORY_EMOJIS = {
  learning: '📚', coding: '💻', career: '🎤',
  research: '📄', productivity: '⚡', creative: '🎨',
};

export default function Marketplace() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (sort !== 'newest') params.sort = sort;

    setLoading(true);
    api.get('/agents', { params })
      .then((res) => setAgents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, sort]);

  const filtered = agents.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-500">Discover AI agents built by creators for every learning need</p>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white text-gray-700"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="popular">Most Used</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all border font-medium ${
              category === c
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:scale-105'
            }`}
          >
            {c !== 'all' && CATEGORY_EMOJIS[c] + ' '}{c}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded mb-3 w-20"></div>
              <div className="h-5 bg-gray-100 rounded mb-2"></div>
              <div className="h-4 bg-gray-100 rounded mb-1 w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">No agents found for "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((agent) => (
            <Link
              key={agent._id}
              to={`/agent/${agent._id}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 block group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border ${CATEGORY_COLORS[agent.category] || 'bg-gray-100 text-gray-600 border-gray-100'}`}>
                  {CATEGORY_EMOJIS[agent.category]} {agent.category}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${agent.price === 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {agent.price === 0 ? '✦ Free' : `₹${agent.price}`}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-gray-600 transition-colors">
                {agent.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{agent.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span>by {agent.creatorId?.name || 'Creator'}</span>
                  {agent.creatorId?.isVerified && (
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full font-medium">
                      ✓
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {agent.reviewCount > 0 && <span>★ {agent.averageRating}</span>}
                  <span>{agent.usageCount} uses</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}