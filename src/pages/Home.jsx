import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const CATEGORY_COLORS = {
  learning: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', emoji: '📚' },
  coding: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', emoji: '💻' },
  career: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', emoji: '🎤' },
  research: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', emoji: '📄' },
  productivity: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100', emoji: '⚡' },
  creative: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100', emoji: '🎨' },
};

export default function Home() {
  const [featuredAgents, setFeaturedAgents] = useState([]);

  useEffect(() => {
    api.get('/agents?sort=popular').then((res) => setFeaturedAgents(res.data.slice(0, 3)));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full mb-8 font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          AI Agents Marketplace — Now Live
        </div>

        <h1 className="text-6xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
          Discover AI agents<br />
          <span className="text-gray-400">built for every need</span>
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Browse, use, and create specialized AI agents for studying, coding, career growth, and research.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            to="/marketplace"
            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
          >
            Browse Marketplace
          </Link>
          <Link
            to="/register"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-all hover:scale-105 active:scale-95"
          >
            Become a Creator
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '5+', label: 'AI Agents' },
            { value: '6', label: 'Categories' },
            { value: '100%', label: 'Free to start' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Featured agents</h2>
            <Link to="/marketplace" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredAgents.map((agent) => {
              const colors = CATEGORY_COLORS[agent.category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', emoji: '🤖' };
              return (
                <Link
                  key={agent._id}
                  to={`/agent/${agent._id}`}
                  className="border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 block"
                >
                  <div className={`w-10 h-10 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center text-lg mb-4`}>
                    {colors.emoji}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{agent.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{agent.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{agent.usageCount} uses</span>
                    <span className={`${colors.bg} ${colors.text} px-2 py-0.5 rounded-full capitalize`}>
                      {agent.category}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Browse by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(CATEGORY_COLORS).map(([name, colors]) => (
            <Link
              key={name}
              to={`/marketplace?category=${name}`}
              className={`${colors.bg} ${colors.border} border rounded-2xl p-5 flex items-center gap-3 hover:opacity-80 transition-all hover:scale-105 active:scale-95`}
            >
              <span className="text-2xl">{colors.emoji}</span>
              <span className={`font-medium ${colors.text} capitalize`}>{name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 mx-6 mb-16 rounded-3xl p-12 text-center max-w-5xl lg:mx-auto">
        <h2 className="text-3xl font-semibold text-white mb-3">Build your own agent</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Create specialized AI agents and share them with thousands of learners on SkillVerse.
        </p>
        <Link
          to="/register"
          className="bg-white text-gray-900 px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 inline-block"
        >
          Start creating →
        </Link>
      </div>
    </div>
  );
}