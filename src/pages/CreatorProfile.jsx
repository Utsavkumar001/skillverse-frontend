import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CATEGORY_COLORS = {
  learning: 'bg-blue-50 text-blue-700',
  coding: 'bg-purple-50 text-purple-700',
  career: 'bg-green-50 text-green-700',
  research: 'bg-amber-50 text-amber-700',
  productivity: 'bg-teal-50 text-teal-700',
  creative: 'bg-pink-50 text-pink-700',
};

export default function CreatorProfile() {
  const { id } = useParams();
  const { user, login } = useAuth();
  const [creator, setCreator] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOwnProfile = user?._id === id || user?.id === id;

  useEffect(() => {
    Promise.all([
      api.get(`/creator-profile/${id}`),
      api.get(`/creator-profile/${id}/agents`),
    ]).then(([creatorRes, agentsRes]) => {
      setCreator(creatorRes.data);
      setAgents(agentsRes.data);
      setEditName(creatorRes.data.name || '');
      setEditBio(creatorRes.data.bio || '');
    }).catch(() => {
      setError('Creator not found');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/creator-profile/update-bio', {
        name: editName,
        bio: editBio,
      });
      setCreator(prev => ({ ...prev, name: data.name, bio: data.bio }));
      // AuthContext update karo
      login(localStorage.getItem('token'), { ...user, name: data.name });
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-20 w-20 bg-gray-100 rounded-full mb-4"></div>
      <div className="h-6 bg-gray-100 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-32"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
      <p className="text-4xl mb-3">👤</p>
      <p>{error}</p>
      <Link to="/marketplace" className="mt-4 text-sm text-gray-900 hover:underline">
        Back to marketplace
      </Link>
    </div>
  );

  const totalUses = agents.reduce((sum, a) => sum + a.usageCount, 0);
  const avgRating = agents.filter(a => a.reviewCount > 0).length > 0
    ? (agents.reduce((sum, a) => sum + a.averageRating, 0) / agents.filter(a => a.reviewCount > 0).length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Back */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        ← Back to marketplace
      </Link>

      {/* Success message */}
      {saveSuccess && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
          ✓ Profile updated successfully!
        </div>
      )}

      {/* Creator Card */}
      <div className="border border-gray-200 rounded-3xl p-8 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-3xl font-semibold shrink-0">
            {(editing ? editName : creator.name)?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {editing ? (
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                ) : (
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl font-semibold text-gray-900">{creator.name}</h1>
                    {creator.isVerified && (
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        ✓ Verified Expert
                      </span>
                    )}
                  </div>
                )}

                {creator.creatorApplication?.expertise && (
                  <p className="text-gray-500 text-sm mb-3">{creator.creatorApplication.expertise}</p>
                )}
              </div>

              {/* Edit button — sirf apne profile pe */}
              {isOwnProfile && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:border-gray-400 transition-colors shrink-0"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-wrap mt-2">
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-900">{agents.length}</p>
                <p className="text-xs text-gray-400">Published Agents</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-900">{totalUses.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Total Uses</p>
              </div>
              {avgRating && (
                <>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900">⭐ {avgRating}</p>
                    <p className="text-xs text-gray-400">Avg Rating</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio section */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">About</h2>

          {editing ? (
            <textarea
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              placeholder="Tell users about yourself — your expertise, experience, what kind of agents you build..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
            />
          ) : (
            creator.bio ? (
              <p className="text-sm text-gray-500 leading-relaxed">{creator.bio}</p>
            ) : (
              isOwnProfile ? (
                <p className="text-sm text-gray-400 italic">
                  No bio yet. Click "Edit Profile" to add one.
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No bio added yet.</p>
              )
            )
          )}

          {/* Save/Cancel buttons */}
          {editing && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditName(creator.name || '');
                  setEditBio(creator.bio || '');
                }}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Links */}
        {(creator.creatorApplication?.linkedin || creator.creatorApplication?.portfolio) && (
          <div className="mt-4 flex gap-3 flex-wrap">
            {creator.creatorApplication?.linkedin && (
              
                href={creator.creatorApplication.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:border-gray-400 transition-colors flex items-center gap-1.5"
              >
                🔗 LinkedIn
              </a>
            )}
            {creator.creatorApplication?.portfolio && (
              
                href={creator.creatorApplication.portfolio}
                target="_blank"
                rel="noreferrer"
                className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:border-gray-400 transition-colors flex items-center gap-1.5"
              >
                🌐 Portfolio
              </a>
            )}
          </div>
        )}
      </div>

      {/* Agents */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Published Agents
          <span className="text-gray-400 font-normal text-sm ml-2">({agents.length})</span>
        </h2>

        {agents.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 text-sm">No published agents yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <Link
                key={agent._id}
                to={`/agent/${agent._id}`}
                className="border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-0.5 block"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-gray-900">{agent.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[agent.category] || 'bg-gray-100 text-gray-600'}`}>
                      {agent.category}
                    </span>
                    {agent.isPublished && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full">
                        ✦ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{agent.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{agent.usageCount} uses</span>
                    {agent.reviewCount > 0 && <span>★ {agent.averageRating}</span>}
                    <span>{agent.price === 0 ? 'Free' : `₹${agent.price}`}</span>
                  </div>
                </div>
                <span className="text-gray-400 ml-4">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}