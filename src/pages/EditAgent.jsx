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
  const [changelog, setChangelog] = useState([]);

  // Changelog form state
  const [newVersion, setNewVersion] = useState('');
  const [newChanges, setNewChanges] = useState('');
  const [addingChangelog, setAddingChangelog] = useState(false);
  const [changelogSuccess, setChangelogSuccess] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

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
        externalApiKey: '',
        knowledgeSources: a.knowledgeSources || [],
      });
      setHasExistingKey(!!a.hasExternalApiKey);
      setChangelog(a.changelog || []);
      setLoading(false);
    });
  }, [id]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleTestConnection = async () => {
    if (!form.externalApiUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const { data } = await api.post('/agents/test-external', {
        url: form.externalApiUrl,
        apiKey: form.externalApiKey || undefined, // if blank, backend just won't send auth header
      });
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.message || 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

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

  const handleAddChangelog = async () => {
    if (!newVersion || !newChanges.trim()) return;
    setAddingChangelog(true);
    try {
      const changes = newChanges.split('\n').map(c => c.trim()).filter(Boolean);
      const { data } = await api.patch(`/agents/${id}/changelog`, {
        version: newVersion,
        changes,
      });
      setChangelog(data.agent.changelog || []);
      setNewVersion('');
      setNewChanges('');
      setChangelogSuccess('Changelog updated!');
      setTimeout(() => setChangelogSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update changelog');
    } finally {
      setAddingChangelog(false);
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
            <button type="button" onClick={() => set('agentType', 'internal')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.agentType === 'internal' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-xl mb-1">🤖</div>
              <p className="font-medium text-sm text-gray-900">Internal</p>
              <p className="text-xs text-gray-500 mt-0.5">Use SkillVerse AI</p>
            </button>
            <button type="button" onClick={() => set('agentType', 'external')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.agentType === 'external' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
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
              onChange={(e) => { set('externalApiUrl', e.target.value); setTestResult(null); }}
              placeholder="https://your-agent-api.com/chat"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">API Key (optional)</label>
            <p className="text-xs text-gray-400 mb-2">
              {hasExistingKey
                ? 'A key is already saved. Leave blank to keep it, or type a new one to replace it.'
                : "If your endpoint needs auth, we'll send it as Authorization: Bearer <key>"}
            </p>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
              value={form.externalApiKey}
              onChange={(e) => { set('externalApiKey', e.target.value); setTestResult(null); }}
              placeholder={hasExistingKey ? '•••••••• (saved — leave blank to keep)' : 'sk-... (leave blank if not needed)'}
            />

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !form.externalApiUrl.trim()}
              className="mt-3 text-xs border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-400 disabled:opacity-40 transition-colors"
            >
              {testing ? '⏳ Testing...' : '🔌 Test Connection'}
            </button>
            {hasExistingKey && !form.externalApiKey && (
              <p className="text-xs text-gray-400 mt-1">Note: testing without typing the key will test without auth.</p>
            )}

            {testResult && (
              <div className={`mt-3 rounded-lg p-3 text-xs ${
                testResult.success
                  ? 'bg-green-50 border border-green-100 text-green-700'
                  : 'bg-red-50 border border-red-100 text-red-600'
              }`}>
                <p className="font-medium">{testResult.success ? '✓ ' : '✗ '}{testResult.message}</p>
                {testResult.sampleReply && (
                  <p className="mt-1 text-gray-500 italic">"{testResult.sampleReply.slice(0, 150)}{testResult.sampleReply.length > 150 ? '...' : ''}"</p>
                )}
              </div>
            )}

            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
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
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        {/* System Prompt */}
        {form.agentType === 'internal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System prompt</label>
            <p className="text-xs text-gray-400 mb-2">This defines your agent's behaviour</p>
            <textarea rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-mono"
              value={form.systemPrompt} onChange={(e) => set('systemPrompt', e.target.value)} />
          </div>
        )}

        {/* Example Prompts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Example prompts</label>
          {form.examplePrompts.map((p, i) => (
            <input key={i}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none mb-2"
              value={p} placeholder={`Example prompt ${i + 1}`}
              onChange={(e) => {
                const arr = [...form.examplePrompts];
                arr[i] = e.target.value;
                set('examplePrompts', arr);
              }} />
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
              <button key={option.value} type="button" onClick={() => set('pricingModel', option.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.pricingModel === option.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
              </button>
            ))}
          </div>

          {form.pricingModel === 'freemium' && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Free queries per day</label>
                <div className="flex gap-2 flex-wrap">
                  {[0, ...FREE_QUERY_OPTIONS].map((n) => (
                    <button key={n} type="button" onClick={() => set('freeQueriesPerDay', n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.freeQueriesPerDay === n ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {n === 0 ? 'None' : n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Free queries per month</label>
                <div className="flex gap-2 flex-wrap">
                  {[0, ...FREE_QUERY_OPTIONS].map((n) => (
                    <button key={n} type="button" onClick={() => set('freeQueriesPerMonth', n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.freeQueriesPerMonth === n ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {n === 0 ? 'None' : n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price after free limit (₹)</label>
                <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={form.price} onChange={(e) => set('price', Number(e.target.value))} placeholder="e.g. 99" />
              </div>
            </div>
          )}

          {form.pricingModel === 'one-time' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.price} onChange={(e) => set('price', Number(e.target.value))} placeholder="e.g. 499" />
            </div>
          )}

          {form.pricingModel === 'monthly' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Monthly price (₹)</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.monthlyPrice} onChange={(e) => set('monthlyPrice', Number(e.target.value))} placeholder="e.g. 99" />
            </div>
          )}

          {form.pricingModel === 'yearly' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Yearly price (₹)</label>
              <input type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                value={form.yearlyPrice} onChange={(e) => set('yearlyPrice', Number(e.target.value))} placeholder="e.g. 999" />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            value={form.tags} onChange={(e) => set('tags', e.target.value)} />
        </div>

        {/* Capabilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
          <p className="text-xs text-gray-400 mb-2">What can this agent do? (one per line)</p>
          <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            value={form.capabilities?.join('\n') || ''}
            onChange={(e) => set('capabilities', e.target.value.split('\n').filter(Boolean))} />
        </div>

        {/* Knowledge Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Sources</label>
          <p className="text-xs text-gray-400 mb-3">What is this agent's knowledge based on? Users will see this as a trust signal.</p>
          <div className="flex gap-2 flex-wrap">
            {['Books', 'Research Papers', 'Personal Notes', 'Company SOPs', 'Videos', 'PDFs', 'Fine-tuned Model', 'External API', 'IIT/University Notes', 'GATE/Exam PYQs'].map((source) => (
              <button key={source} type="button"
                onClick={() => {
                  const current = form.knowledgeSources || [];
                  const updated = current.includes(source)
                    ? current.filter(s => s !== source)
                    : [...current, source];
                  set('knowledgeSources', updated);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  (form.knowledgeSources || []).includes(source)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}>
                {(form.knowledgeSources || []).includes(source) ? '✓ ' : ''}{source}
              </button>
            ))}
          </div>
          {(form.knowledgeSources || []).length > 0 && (
            <p className="text-xs text-gray-400 mt-2">Selected: {form.knowledgeSources.join(', ')}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Version & Changelog</h2>
          <p className="text-xs text-gray-400 mb-4">
            Let users know what's new. Each update builds trust and shows your agent is actively maintained.
          </p>

          {/* Add new changelog entry */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Add Update</p>

            {changelogSuccess && (
              <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg mb-3">
                ✓ {changelogSuccess}
              </div>
            )}

            <div className="flex gap-3 mb-3">
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Version</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g. 1.1"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                What changed? (one per line)
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                placeholder={"Improved reasoning accuracy\nAdded UPSC examples\nFaster responses"}
                value={newChanges}
                onChange={(e) => setNewChanges(e.target.value)}
              />
            </div>

            <button
              onClick={handleAddChangelog}
              disabled={addingChangelog || !newVersion || !newChanges.trim()}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {addingChangelog ? 'Adding...' : '+ Add to Changelog'}
            </button>
          </div>

          {/* Existing changelog */}
          {changelog.length > 0 && (
            <div className="space-y-3">
              {changelog.map((entry, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-full">
                      v{entry.version}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {entry.changes.map((change, j) => (
                      <li key={j} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5 shrink-0">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {changelog.length === 0 && (
            <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
              <p className="text-xs text-gray-400">No changelog entries yet</p>
            </div>
          )}
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