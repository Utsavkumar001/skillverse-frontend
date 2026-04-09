import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['learning', 'coding', 'career', 'research', 'productivity', 'creative'];

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
        systemPrompt: a.systemPrompt,
        examplePrompts: a.examplePrompts?.length ? a.examplePrompts : ['', '', ''],
        price: a.price,
        pricingModel: a.pricingModel,
        tags: a.tags?.join(', ') || '',
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
        <button
          onClick={() => navigate('/creator/dashboard')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ←
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Agent</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agent name</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

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

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pricing model</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              value={form.pricingModel}
              onChange={(e) => { set('pricingModel', e.target.value); if (e.target.value === 'free') set('price', 0); }}
            >
              <option value="free">Free</option>
              <option value="one-time">One-time purchase</option>
              <option value="monthly">Monthly subscription</option>
            </select>
          </div>
          {form.pricingModel !== 'free' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.price}
                onChange={(e) => set('price', Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
          />
        </div>

        <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
  <p className="text-xs text-gray-400 mb-2">What can this agent do? (one per line)</p>
  <textarea
    rows={4}
    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
    placeholder={"Explains concepts step by step\nGives code examples"}
    value={form.capabilities?.join('\n') || ''}
    onChange={(e) => set('capabilities', e.target.value.split('\n').filter(Boolean))}
  />
</div>

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