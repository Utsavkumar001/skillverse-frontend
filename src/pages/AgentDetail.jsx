import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

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

export default function AgentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
  Promise.all([
    api.get(`/agents/${id}`),
    api.get(`/reviews/${id}`),
    user ? api.get(`/chat/${id}/status`).catch(() => ({ data: { isPaid: false } })) : Promise.resolve({ data: { isPaid: false } }),
  ]).then(([agentRes, reviewRes, statusRes]) => {
    setAgent(agentRes.data);
    setReviews(reviewRes.data);
    setIsPurchased(statusRes.data.isPaid);
  }).catch(() => {
    setLoading(false);
  }).finally(() => setLoading(false));
}, [id, user]);

  const handleUse = () => {
    if (!user) return navigate('/login');
    if (agent.price > 0) {
      setShowPayment(true);
    } else {
      navigate(`/chat/${id}`);
    }
  };

  const handleShare = () => {
  navigator.clipboard.writeText(window.location.href);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

  const submitReview = async () => {
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, review);
      setReviews([data, ...reviews]);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-20 mb-4"></div>
      <div className="h-8 bg-gray-100 rounded w-64 mb-3"></div>
      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
    </div>
  );

  if (!agent) return (
    <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
      <p className="text-4xl mb-3">🤖</p>
      <p>Agent not found</p>
      <Link to="/marketplace" className="mt-4 text-sm text-gray-900 hover:underline">
        Back to marketplace
      </Link>
      <button
    onClick={handleShare}
    className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-2"
  >
    {copied ? '✓ Copied!' : '🔗 Share'}
  </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Back */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        ← Back to marketplace
      </Link>

      {/* Header card */}
      <div className="border border-gray-200 rounded-3xl p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border ${CATEGORY_COLORS[agent.category] || 'bg-gray-100 text-gray-600 border-gray-100'}`}>
                {CATEGORY_EMOJIS[agent.category]} {agent.category}
              </span>
              {agent.creatorId?.isVerified && (
                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full text-xs font-medium">
                  ✓ Verified Creator
                </span>
              )}
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">{agent.title}</h1>
            <p className="text-gray-500 leading-relaxed">{agent.description}</p>
          </div>
          <div className="text-right ml-8 shrink-0">
            <p className="text-3xl font-semibold text-gray-900">
              {agent.price === 0 ? 'Free' : `₹${agent.price}`}
            </p>
            {agent.pricingModel !== 'free' && (
              <p className="text-xs text-gray-400 capitalize mt-0.5">{agent.pricingModel}</p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
          <span>by {agent.creatorId?.name}</span>
          {agent.reviewCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              {agent.averageRating} ({agent.reviewCount} reviews)
            </span>
          )}
          <span>{agent.usageCount} uses</span>
          {agent.price > 0 && !isPurchased && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
              3 free messages
            </span>
          )}
          {isPurchased && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
              ✓ Purchased
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {isPurchased ? (
            <button
              onClick={() => navigate(`/chat/${id}`)}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-all"
            >
              ✓ Continue chatting →
            </button>
          ) : agent.price === 0 ? (
            <button
              onClick={() => {
                if (!user) return navigate('/login');
                navigate(`/chat/${id}`);
              }}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-all"
            >
              Try for free →
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  if (!user) return navigate('/login');
                  navigate(`/chat/${id}`);
                }}
                className="w-full border border-gray-200 text-gray-700 py-3.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-all"
              >
                Try 3 free messages →
              </button>
              <button
                onClick={handleUse}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-all"
              >
                Buy for ₹{agent.price} →
              </button>
            </>
          )}
        </div>
      </div>

      {agent.capabilities?.length > 0 && (
  <div className="mb-6">
    <h2 className="font-semibold text-gray-900 mb-3">What this agent can do</h2>
    <div className="space-y-2">
      {agent.capabilities.map((cap, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="text-green-500 mt-0.5 shrink-0">✓</span>
          <span className="text-sm text-gray-600">{cap}</span>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Example prompts */}
      {agent.examplePrompts?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Example prompts</h2>
          <div className="space-y-2">
            {agent.examplePrompts.map((p, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 hover:border-gray-400 transition-colors cursor-default"
              >
                "{p}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {agent.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {agent.tags.map((tag, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Embed Section — show only to creator */}
{user && agent.creatorId?._id === user.id && (
  <div className="border border-gray-200 rounded-2xl p-5 mb-6">
    <h2 className="font-semibold text-gray-900 mb-1">Embed this agent</h2>
    <p className="text-sm text-gray-500 mb-3">Add this agent to any website with one line of code.</p>
    <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-600 break-all select-all border border-gray-100">
      {`<iframe src="${window.location.origin}/embed/${agent._id}" width="100%" height="600" frameborder="0" style="border-radius:16px;"></iframe>`}
    </div>
    <button
      onClick={() => {
        navigator.clipboard.writeText(
          `<iframe src="${window.location.origin}/embed/${agent._id}" width="100%" height="600" frameborder="0" style="border-radius:16px;"></iframe>`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="mt-3 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-colors"
    >
      {copied ? '✓ Copied!' : 'Copy embed code'}
    </button>
  </div>
)}

      {/* Reviews */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">
          Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
        </h2>

        {user && (
          <div className="border border-gray-200 rounded-2xl p-5 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Leave a review</p>
            <div className="flex gap-1.5 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReview({ ...review, rating: star })}
                  className={`text-2xl transition-transform hover:scale-110 ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 mb-3 transition-all"
              placeholder="Share your experience..."
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
            />
            <button
              onClick={submitReview}
              disabled={submitting}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit review'}
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{r.userId?.name}</span>
                  <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-500">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal
          agent={agent}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            setIsPurchased(true);
            navigate(`/chat/${id}`);
          }}
        />
      )}

    </div>
  );
}