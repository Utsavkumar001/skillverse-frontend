import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['learning', 'coding', 'career', 'research', 'productivity', 'creative'];
const FREE_QUERY_OPTIONS = [5, 10, 15, 20, 25, 40, 50];

export default function EditAgent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/agents/${id}`).then((res) => {
      const a = res.data;
      setForm({
        title: a.title,
        description: a.description,
        category: a.category,
        systemPrompt: a.systemPrompt || '',
        examplePrompts: a.examplePrompts?.length ? a.examplePrompts : ['', '', ''],
        price: a.price || 0,
        monthlyPrice: a.monthlyPrice || 0,
        yearlyPrice: a.yearlyPrice || 0,
        pricingModel: a.pricingModel || 'free',
        freeQueriesPerDay: a.freeQueriesPerDay || 0,
        freeQueriesPerMonth: a.freeQueriesPerMonth || 0,
        tags: a.tags?.join(', ') || '',
        capabilities: a.capabilities || [],
        agentType: a.agentType || 'internal',
        externalApiUrl: a.externalApiUrl || '',
      });
      setLoading(false);
    });
  }, [id]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/agents/${id}`, {
        ...form,
        examplePrompts: form.examplePrompts.filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      navigate('/creator/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/creator/dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors">←</button>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Agent</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

      <div className="space-y-5">

        {/* Agent Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agent Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => set('agentType', 'internal')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                form.agentType === 'internal' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">🤖</div>
              <p className="font-medium text-sm text-gray-900">Internal</p>
              <p className="text-xs text-gray-500 mt-0.5">Use SkillVerse AI</p>
            </button>
            <button
              type="button"
              onClick={() => set('agentType', 'external')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                form.agentType === 'external' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">🔗</div>
              <p className="font-medium text-sm text-gray-900">External</p>
              <p className="text-xs text-gray-500 mt-0.5">Connect your own API</p>
            </button>
          </div>
        </div>

        {/* External API URL */}
        {form.agentType === 'external' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint URL</label>
            <p className="text-xs text-gray-400 mb-2">Your agent's API URL — we'll send POST requests with user messages</p>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
              value={form.externalApiUrl}
              onChange={(e) => set('externalApiUrl', e.target.value)}
              placeholder="https://your-agent-api.com/chat"
            />
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-700 font-medium mb-1">📡 Request format we'll send:</p>
              <code className="text-xs text-blue-600 font-mono">{`POST {url}\n{ "message": "user message", "history": [...] }`}</code>
              <p className="text-xs text-blue-700 font-medium mt-2 mb-1">📨 Expected response:</p>
              <code className="text-xs text-blue-600 font-mono">{`{ "reply": "your agent's response" }`}</code>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agent name</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        {/* System Prompt — only internal */}
        {form.agentType === 'internal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System prompt</label>
            <p className="text-xs text-gray-400 mb-2">This defines your agent's behaviour</p>
            <textarea
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-mono"
              value={form.systemPrompt}
              onChange={(e) => set('systemPrompt', e.target.value)}
            />
          </div>
        )}

        {/* Example Prompts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Example prompts</label>
          {form.examplePrompts.map((p, i) => (
            <input
              key={i}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none mb-2"
              value={p}
              placeholder={`Example prompt ${i + 1}`}
              onChange={(e) => {
                const arr = [...form.examplePrompts];
                arr[i] = e.target.value;
                set('examplePrompts', arr);
              }}
            />
          ))}
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Model</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { value: 'free', label: '🆓 Free', desc: 'Unlimited free access' },
              { value: 'freemium', label: '⚡ Freemium', desc: 'Free with query limits' },
              { value: 'one-time', label: '💳 One-time', desc: 'Single payment' },
              { value: 'monthly', label: '📅 Monthly', desc: 'Monthly subscription' },
              { value: 'yearly', label: '🗓️ Yearly', desc: 'Annual subscription' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set('pricingModel', option.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.pricingModel === option.value
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
              </button>
            ))}
          </div>

          {/* Freemium */}
          {form.pricingModel === 'freemium' && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Free queries per day</label>
                <div className="flex gap-2 flex-wrap">
                  {[0, ...FREE_QUERY_OPTIONS].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('freeQueriesPerDay', n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.freeQueriesPerDay === n
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {n === 0 ? 'None' : n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Free queries per month</label>
                <div className="flex gap-2 flex-wrap">
                  {[0, ...FREE_QUERY_OPTIONS].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('freeQueriesPerMonth', n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.freeQueriesPerMonth === n
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {n === 0 ? 'None' : n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price after free limit (₹)</label>
                <input
                  type="number" min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={form.price}
                  onChange={(e) => set('price', Number(e.target.value))}
                  placeholder="e.g. 99"
                />
              </div>
            </div>
          )}

          {form.pricingModel === 'one-time' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number" min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.price}
                onChange={(e) => set('price', Number(e.target.value))}
                placeholder="e.g. 499"
              />
            </div>
          )}

          {form.pricingModel === 'monthly' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Monthly price (₹)</label>
              <input
                type="number" min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.monthlyPrice}
                onChange={(e) => set('monthlyPrice', Number(e.target.value))}
                placeholder="e.g. 99"
              />
            </div>
          )}

          {form.pricingModel === 'yearly' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Yearly price (₹)</label>
              <input
                type="number" min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.yearlyPrice}
                onChange={(e) => set('yearlyPrice', Number(e.target.value))}
                placeholder="e.g. 999"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
          />
        </div>

        {/* Capabilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
          <p className="text-xs text-gray-400 mb-2">What can this agent do? (one per line)</p>
          <textarea
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            value={form.capabilities?.join('\n') || ''}
            onChange={(e) => set('capabilities', e.target.value.split('\n').filter(Boolean))}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}