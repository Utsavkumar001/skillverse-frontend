import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function CreatorDashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/agents/creator/mine')
      .then((res) => setAgents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePublish = async (id) => {
    await api.patch(`/agents/${id}/publish`);
    setAgents(agents.map((a) => a._id === id ? { ...a, isPublished: true } : a));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Agents</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track your published agents</p>
        </div>
        <Link
          to="/creator/build"
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Create Agent
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">Total agents</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{agents.length}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {agents.filter((a) => a.isPublished).length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">Total uses</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {agents.reduce((sum, a) => sum + a.usageCount, 0)}
          </p>
        </div>
      </div>

      {/* Agent list */}
      {loading ? (
        <div className="text-center text-gray-400 mt-10">Loading...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 mb-4">No agents yet</p>
          <Link to="/creator/build" className="text-sm text-gray-900 font-medium hover:underline">
            Create your first agent →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent._id} className="border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{agent.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${agent.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {agent.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{agent.usageCount} uses · {agent.reviewCount} reviews · ★ {agent.averageRating}</p>
              </div>
              <div className="flex gap-2">
                {!agent.isPublished && (
                  <button
                    onClick={() => handlePublish(agent._id)}
                    className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Publish
                  </button>
                )}
                <Link
                  to={`/agent/${agent._id}`}
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}