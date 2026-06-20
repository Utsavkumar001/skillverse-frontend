import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TABS = ['Overview', 'Users', 'Agents', 'Creator Applications'];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');

  useEffect(() => {
    loadData();
    setSearch('');
    setAppFilter('all');
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'Overview') {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } else if (tab === 'Users') {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } else if (tab === 'Agents') {
        const { data } = await api.get('/admin/agents');
        setAgents(data);
      } else if (tab === 'Creator Applications') {
        const { data } = await api.get('/creator-application/all');
        setApplications(data);
      }
    } catch (err) {
      if (err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (id, isBanned) => {
    const reason = isBanned ? null : prompt('Ban reason:');
    if (!isBanned && !reason) return;
    await api.patch(`/admin/users/${id}/${isBanned ? 'unban' : 'ban'}`, { reason });
    setUsers(users.map(u => u._id === id ? { ...u, isBanned: !isBanned } : u));
  };

  const handleVerifyUser = async (id) => {
    await api.patch(`/admin/users/${id}/verify`);
    setUsers(users.map(u => u._id === id ? { ...u, isVerified: true, isEmailVerified: true } : u));
  };

  const handleAgentAction = async (id, action) => {
    if (action === 'delete' && !confirm('Delete this agent?')) return;
    if (action === 'delete') {
      await api.delete(`/admin/agents/${id}`);
      setAgents(agents.filter(a => a._id !== id));
    } else {
      await api.patch(`/admin/agents/${id}/${action}`);
      setAgents(agents.map(a => a._id === id ? { ...a, isPublished: action === 'approve' } : a));
    }
  };

  const handleApproveCreator = async (id) => {
    try {
      await api.patch(`/creator-application/${id}/approve`);
      setApplications(applications.map(a =>
        a._id === id ? { ...a, creatorStatus: 'approved', role: 'creator' } : a
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectCreator = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/creator-application/${id}/reject`, { reason });
      setApplications(applications.map(a =>
        a._id === id ? { ...a, creatorStatus: 'rejected' } : a
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAgents = agents.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApplications = applications.filter(a => {
    if (appFilter === 'all') return true;
    return a.creatorStatus === appFilter;
  });

  const pendingCount = applications.filter(a => a.creatorStatus === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-0.5">SkillVerse platform management</p>
        </div>
        <span className="bg-red-50 text-red-600 border border-red-100 text-xs px-3 py-1.5 rounded-full font-medium">
          🔐 Admin Only
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-2 ${
              tab === t
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'Creator Applications' && pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 mt-20">Loading...</div>
      ) : (
        <>
          {/* Overview */}
          {tab === 'Overview' && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Total Agents', value: stats.totalAgents, icon: '🤖' },
                { label: 'Published', value: stats.publishedAgents, icon: '✅' },
                { label: 'Pending Review', value: stats.pendingAgents, icon: '⏳' },
                { label: 'Verified Users', value: stats.verifiedUsers, icon: '📧' },
                { label: 'Banned Users', value: stats.bannedUsers, icon: '🚫' },
                { label: 'Platform Revenue', value: `₹${(stats.totalRevenue * 0.2).toFixed(0)}`, icon: '💰' },
                { label: 'Creator Payouts', value: `₹${(stats.totalRevenue).toFixed(0)}`, icon: '💸' },
              ].map((stat) => (
                <div key={stat.label} className="border border-gray-200 rounded-2xl p-4">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'Users' && (
            <div>
              <input
                type="text"
                placeholder="Search users..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`border rounded-2xl p-4 flex items-center justify-between ${
                      user.isBanned ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        {user.isVerified && (
                          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full">✓ Verified</span>
                        )}
                        {user.role === 'creator' && (
                          <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-1.5 py-0.5 rounded-full">🛠️ Creator</span>
                        )}
                        {user.isBanned && (
                          <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full">🚫 Banned</span>
                        )}
                        {!user.isEmailVerified && (
                          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full">📧 Unverified</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {user.email} · {user.role} · Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      {user.isBanned && user.banReason && (
                        <p className="text-xs text-red-500 mt-1">Reason: {user.banReason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!user.isVerified && (
                        <button
                          onClick={() => handleVerifyUser(user._id)}
                          className="text-xs border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleBan(user._id, user.isBanned)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors border ${
                          user.isBanned
                            ? 'border-green-200 text-green-600 hover:bg-green-50'
                            : 'border-red-200 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No users found</div>
                )}
              </div>
            </div>
          )}

          {/* Agents */}
          {tab === 'Agents' && (
            <div>
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="space-y-3">
                {filteredAgents.map((agent) => (
                  <div key={agent._id} className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{agent.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          agent.isPublished ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {agent.isPublished ? 'Published' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        by {agent.creatorId?.name} · {agent.category} · ₹{agent.price} · {agent.usageCount} uses
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!agent.isPublished ? (
                        <button
                          onClick={() => handleAgentAction(agent._id, 'approve')}
                          className="text-xs border border-green-200 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          ✓ Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAgentAction(agent._id, 'reject')}
                          className="text-xs border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        onClick={() => handleAgentAction(agent._id, 'delete')}
                        className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {filteredAgents.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No agents found</div>
                )}
              </div>
            </div>
          )}

          {/* Creator Applications */}
          {tab === 'Creator Applications' && (
            <div>
              {/* Filter buttons */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setAppFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                      appFilter === f
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {f}
                    {f === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app._id}
                    className={`border rounded-2xl p-5 ${
                      app.creatorStatus === 'approved' ? 'border-green-200 bg-green-50' :
                      app.creatorStatus === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Name + status */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-gray-900">{app.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            app.creatorStatus === 'approved' ? 'bg-green-100 text-green-700' :
                            app.creatorStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {app.creatorStatus === 'approved' ? '✓ Approved' :
                             app.creatorStatus === 'rejected' ? '✗ Rejected' :
                             '⏳ Pending'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mb-3">
                          {app.email} · Applied {
                            app.creatorApplication?.appliedAt
                              ? new Date(app.creatorApplication.appliedAt).toLocaleDateString('en-IN')
                              : 'N/A'
                          }
                        </p>

                        {/* Details */}
                        <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-600">Expertise: </span>
                            <span className="text-xs text-gray-500">{app.creatorApplication?.expertise || '—'}</span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-600">Reason: </span>
                            <span className="text-xs text-gray-500">{app.creatorApplication?.reason || '—'}</span>
                          </div>
                          {app.creatorApplication?.linkedin && (
                            <div>
                              <span className="text-xs font-medium text-gray-600">LinkedIn: </span>
                              <a
                                href={app.creatorApplication.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {app.creatorApplication.linkedin}
                              </a>
                            </div>
                          )}
                          {app.creatorApplication?.portfolio && (
                            <div>
                              <span className="text-xs font-medium text-gray-600">Portfolio: </span>
                              <a
                                href={app.creatorApplication.portfolio}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {app.creatorApplication.portfolio}
                              </a>
                            </div>
                          )}
                          {app.creatorStatus === 'rejected' && app.creatorApplication?.rejectionReason && (
                            <div>
                              <span className="text-xs font-medium text-red-600">Rejection Reason: </span>
                              <span className="text-xs text-red-500">{app.creatorApplication.rejectionReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approve / Reject buttons */}
                      {app.creatorStatus === 'pending' && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveCreator(app._id)}
                            className="text-xs border border-green-200 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleRejectCreator(app._id)}
                            className="text-xs border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredApplications.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-gray-400 text-sm">No applications found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}