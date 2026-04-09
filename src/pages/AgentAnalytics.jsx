import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function AgentAnalytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/agents/${id}`),
      api.get(`/agents/${id}/analytics`),
    ]).then(([agentRes, analyticsRes]) => {
      setAgent(agentRes.data);
      setData(analyticsRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center mt-20 text-gray-400">Loading...</div>;

  const maxMessages = Math.max(...data.last7Days.map(d => d.messages), 1);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/creator/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{agent?.title}</h1>
          <p className="text-sm text-gray-400">Analytics Dashboard</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: data.totalUsers, icon: '👥' },
          { label: 'Paid Users', value: data.paidUsers, icon: '💳' },
          { label: 'Total Messages', value: data.totalMessages, icon: '💬' },
          { label: 'Revenue', value: `₹${data.revenue}`, icon: '💰' },
          { label: 'Avg Rating', value: data.avgRating || '—', icon: '⭐' },
          { label: 'Total Uses', value: data.usageCount, icon: '🚀' },
        ].map((stat) => (
          <div key={stat.label} className="border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Messages Last 7 Days Chart */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6">Messages — Last 7 Days</h2>
        <div className="flex items-end gap-3 h-40">
          {data.last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {day.messages > 0 ? day.messages : ''}
              </span>
              <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                <div
                  className="w-full bg-gray-900 rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max((day.messages / maxMessages) * 100, day.messages > 0 ? 8 : 2)}px`,
                    opacity: day.messages > 0 ? 1 : 0.15,
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 text-center">{day.date}</span>
            </div>
          ))}
        </div>
        {data.last7Days.every(d => d.messages === 0) && (
          <p className="text-center text-sm text-gray-400 mt-4">No messages yet this week</p>
        )}
      </div>

      {/* Conversion */}
      <div className="border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Conversion Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gray-900 h-full rounded-full transition-all"
              style={{ width: `${data.totalUsers > 0 ? (data.paidUsers / data.totalUsers) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 shrink-0">
            {data.totalUsers > 0
              ? `${((data.paidUsers / data.totalUsers) * 100).toFixed(0)}%`
              : '0%'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {data.paidUsers} of {data.totalUsers} users converted to paid
        </p>
      </div>
    </div>
  );
}