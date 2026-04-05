import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORY_COLORS = {
  learning: 'bg-blue-50 text-blue-700',
  coding: 'bg-purple-50 text-purple-700',
  career: 'bg-green-50 text-green-700',
  research: 'bg-amber-50 text-amber-700',
  productivity: 'bg-teal-50 text-teal-700',
  creative: 'bg-pink-50 text-pink-700',
};

export default function MyLibrary() {
  const [purchased, setPurchased] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat/my-agents')
      .then((res) => setPurchased(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Library</h1>
      <p className="text-gray-500 text-sm mb-8">Agents you have purchased or used</p>

      {loading ? (
        <div className="text-center text-gray-400 mt-20">Loading...</div>
      ) : purchased.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-gray-400 mb-4">No agents yet</p>
          <Link to="/marketplace" className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {purchased.map(({ agent, isPaid, trialCount }) => (
            <Link
              key={agent._id}
              to={`/chat/${agent._id}`}
              className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 block"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${CATEGORY_COLORS[agent.category] || 'bg-gray-100 text-gray-600'}`}>
                  {agent.category}
                </span>
                {isPaid ? (
                  <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-medium">
                    ✓ Purchased
                  </span>
                ) : (
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
                    {Math.max(0, 3 - trialCount)} free left
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{agent.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{agent.description}</p>
              <p className="text-xs text-gray-400">Tap to continue chatting →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}