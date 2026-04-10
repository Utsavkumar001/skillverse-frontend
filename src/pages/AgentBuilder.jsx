import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['learning', 'coding', 'career', 'research', 'productivity', 'creative'];

export default function AgentBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'learning',
    systemPrompt: '',
    examplePrompts: ['', '', ''],
    price: 0,
    pricingModel: 'free',
    tags: '',
    capabilities: [],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (publish = false) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        examplePrompts: form.examplePrompts.filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const { data } = await api.post('/agents', payload);
      if (publish) await api.patch(`/agents/${data._id}/publish`);
      navigate('/creator/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Agent</h1>
      <p className="text-gray-500 text-sm mb-8">Define your AI agent's personality and knowledge</p>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agent name</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. DSA Mentor" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="What does this agent help with?" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">System prompt</label>
          <p className="text-xs text-gray-400 mb-2">This is the hidden instruction that defines your agent's behaviour</p>
          <textarea rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-mono"
            value={form.systemPrompt} onChange={(e) => set('systemPrompt', e.target.value)}
            placeholder="You are a helpful DSA mentor..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Example prompts (shown to users)</label>
          {form.examplePrompts.map((p, i) => (
            <input key={i} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none mb-2"
              value={p} placeholder={`Example prompt ${i + 1}`}
              onChange={(e) => {
                const arr = [...form.examplePrompts];
                arr[i] = e.target.value;
                set('examplePrompts', arr);
              }} />
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pricing model</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              value={form.pricingModel}
              onChange={(e) => { set('pricingModel', e.target.value); if (e.target.value === 'free') set('price', 0); }}>
              <option value="free">Free</option>
              <option value="one-time">One-time purchase</option>
              <option value="monthly">Monthly subscription</option>
            </select>
          </div>
          {form.pricingModel !== 'free' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="DSA, algorithms, interview prep" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
          <p className="text-xs text-gray-400 mb-2">What can this agent do? (one per line)</p>
          <textarea
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            placeholder={"Explains concepts step by step\nGives code examples\nAnswers follow-up questions"}
            value={form.capabilities?.join('\n') || ''}
            onChange={(e) => setForm({ ...form, capabilities: e.target.value.split('\n').filter(Boolean) })}
          />
        </div>

        {/* Submit buttons — blocked if email not verified */}
        {!user?.isEmailVerified ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
            <p className="text-sm font-medium text-amber-800 mb-1">📧 Verify your email first</p>
            <p className="text-xs text-amber-600">Check your inbox for the verification link to create and publish agents.</p>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Save draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Publish agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}