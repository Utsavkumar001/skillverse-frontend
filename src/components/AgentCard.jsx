import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  learning: 'bg-blue-50 text-blue-700',
  coding: 'bg-purple-50 text-purple-700',
  career: 'bg-green-50 text-green-700',
  research: 'bg-amber-50 text-amber-700',
  productivity: 'bg-teal-50 text-teal-700',
  creative: 'bg-pink-50 text-pink-700',
};

export default function AgentCard({ agent }) {
  return (
    <Link
      to={`/agent/${agent._id}`}
      className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${CATEGORY_COLORS[agent.category] || 'bg-gray-100 text-gray-600'}`}>
          {agent.category}
        </span>
        <span className="text-xs text-gray-400">
          {agent.price === 0 ? 'Free' : `₹${agent.price}`}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1.5">{agent.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{agent.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span>by {agent.creatorId?.name || 'Creator'}</span>
          {agent.creatorId?.isVerified && (
            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full text-xs font-medium">
              ✓ Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {agent.reviewCount > 0 && <span>★ {agent.averageRating}</span>}
          <span>{agent.usageCount} uses</span>
        </div>
      </div>
    </Link>
  );
}