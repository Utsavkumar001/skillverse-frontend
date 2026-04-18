import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';


export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ agentsUsed: 0, agentsPurchased: 0, agentsCreated: 0 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const { user, login } = useAuth();
  const isCreator = user?.role === 'creator' || user?.role === 'admin';

  useEffect(() => {
    api.get('/auth/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/update-profile', { name });
      login(localStorage.getItem('token'), { ...user, name: data.name });
      setSuccess('Profile updated!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Profile</h1>

      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Avatar + Info */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            {editing ? (
              <input
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            )}
            <p className="text-sm text-gray-400 capitalize">{user?.role} · {user?.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setName(user?.name); }}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:border-gray-400 transition-colors"
          >
            Edit name
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Agents used', value: stats.agentsUsed },
          { label: 'Agents purchased', value: stats.agentsPurchased },
          { label: 'Agents created', value: stats.agentsCreated },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
  {[
    { label: '📚 My Library', path: '/my-library', show: true },
    { label: '📊 Creator Dashboard', path: '/creator/dashboard', show: isCreator },
    { label: '➕ Create Agent', path: '/creator/build', show: isCreator },
  ].filter(item => item.show).map((item) => (
    <button
      key={item.path}
      onClick={() => navigate(item.path)}
      className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <span>{item.label}</span>
      <span className="text-gray-400">→</span>
    </button>
  ))}
</div>
    </div>
  );
}