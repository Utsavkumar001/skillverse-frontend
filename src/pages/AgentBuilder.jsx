import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['learning', 'coding', 'career', 'research', 'productivity', 'creative'];

const FREE_QUERY_OPTIONS = [5, 10, 15, 20, 25, 40, 50];

const BLANK_FORM = {
  title: '',
  description: '',
  category: 'learning',
  systemPrompt: '',
  examplePrompts: ['', '', ''],
  price: 0,
  monthlyPrice: 0,
  yearlyPrice: 0,
  pricingModel: 'free',
  freeQueriesPerDay: 0,
  freeQueriesPerMonth: 0,
  tags: '',
  capabilities: [],
  externalApiUrl: '',
  agentType: 'internal', // 'internal' | 'external'
};

const TEMPLATES = [
  {
    name: '📚 Study Tutor',
    form: {
      title: 'Study Tutor',
      description: 'Learn any topic with adaptive explanations and mini quizzes',
      category: 'learning',
      systemPrompt: `You are an expert study tutor. Your job is to:
- Explain concepts clearly using simple language and analogies
- Give real-world examples to make topics relatable
- Ask the student questions to check understanding
- Provide mini quizzes when requested
- Adapt your explanation style based on student's level
Always be encouraging and patient.`,
      examplePrompts: ['Explain photosynthesis simply', 'Quiz me on World War 2', 'Help me understand calculus derivatives'],
      price: 0, pricingModel: 'free',
      tags: 'study, learning, education, tutor',
      capabilities: ['Explains concepts step by step', 'Creates mini quizzes', 'Adapts to your level', 'Gives real-world examples'],
    },
  },
  {
    name: '💻 Code Reviewer',
    form: {
      title: 'Code Reviewer',
      description: 'Get detailed code reviews, bug fixes, and optimization suggestions',
      category: 'coding',
      systemPrompt: `You are an expert code reviewer with 10+ years of experience.
When given code:
1. Identify bugs and errors
2. Suggest performance optimizations
3. Check for security vulnerabilities
4. Recommend better patterns and practices
5. Explain WHY each change improves the code`,
      examplePrompts: ['Review this Python function: [paste code]', 'Find bugs in my JavaScript: [paste code]', 'How can I optimize this SQL query?'],
      price: 49, pricingModel: 'one-time',
      tags: 'coding, code review, debugging, optimization',
      capabilities: ['Finds bugs and errors', 'Suggests optimizations', 'Checks security issues', 'Supports all languages'],
    },
  },
  {
    name: '🎤 Interview Coach',
    form: {
      title: 'Interview Coach',
      description: 'Practice interviews with realistic questions and detailed feedback',
      category: 'career',
      systemPrompt: `You are an expert interview coach with experience at top companies.
- Ask realistic interview questions based on the role/company
- Give detailed feedback on answers
- Suggest improvements with example answers
- Cover: behavioral, technical, and situational questions`,
      examplePrompts: ['Prepare me for a Google SWE interview', 'Ask me behavioral questions for a PM role', 'Give feedback on this answer: [paste answer]'],
      price: 99, pricingModel: 'monthly',
      tags: 'interview, career, job prep, coaching',
      capabilities: ['Realistic interview simulation', 'Detailed answer feedback', 'Role-specific questions', 'Behavioral and technical prep'],
    },
  },
];

export default function AgentBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(BLANK_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [importMode, setImportMode] = useState('manual'); // 'manual' | 'json'
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('agentDraft');
    if (saved) {
      try { setForm(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('agentDraft', JSON.stringify(form));
  }, [form]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const clearDraft = () => {
    localStorage.removeItem('agentDraft');
    setForm(BLANK_FORM);
  };

  // JSON Import
  const handleJsonImport = (text) => {
    setJsonError('');
    try {
      const parsed = JSON.parse(text);
      if (!parsed.title) return setJsonError('Missing required field: title');
      if (!parsed.systemPrompt && !parsed.externalApiUrl) return setJsonError('Missing required field: systemPrompt or externalApiUrl');

      setForm({
        ...BLANK_FORM,
        title: parsed.title || '',
        description: parsed.description || '',
        category: parsed.category || 'learning',
        systemPrompt: parsed.systemPrompt || '',
        examplePrompts: parsed.examplePrompts?.length ? parsed.examplePrompts : ['', '', ''],
        capabilities: parsed.capabilities || [],
        price: parsed.price || 0,
        monthlyPrice: parsed.monthlyPrice || 0,
        yearlyPrice: parsed.yearlyPrice || 0,
        pricingModel: parsed.pricingModel || 'free',
        freeQueriesPerDay: parsed.freeQueriesPerDay || 0,
        freeQueriesPerMonth: parsed.freeQueriesPerMonth || 0,
        tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || ''),
        externalApiUrl: parsed.externalApiUrl || '',
        agentType: parsed.externalApiUrl ? 'external' : 'internal',
      });

      setImportMode('manual');
      setJsonInput('');
    } catch (e) {
      setJsonError('Invalid JSON format. Please check your input.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) return setJsonError('Please upload a .json file');
    const reader = new FileReader();
    reader.onload = (event) => handleJsonImport(event.target.result);
    reader.readAsText(file);
  };

  // Save draft
  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        examplePrompts: form.examplePrompts.filter(Boolean),
        tags: typeof form.tags === 'string'
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : form.tags,
      };
      await api.post('/agents', payload);
      localStorage.removeItem('agentDraft');
      navigate('/creator/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  // Submit for review
  const handleSubmitForReview = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        examplePrompts: form.examplePrompts.filter(Boolean),
        tags: typeof form.tags === 'string'
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : form.tags,
      };
      const { data } = await api.post('/agents', payload);
      await api.patch(`/agents/${data._id}/submit-review`);
      localStorage.removeItem('agentDraft');
      navigate('/creator/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create Agent</h1>
          <p className="text-gray-500 text-sm">Define your AI agent's personality and knowledge</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">💾 Autosaved</span>
          <button onClick={clearDraft} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Clear draft
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setImportMode('manual')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            importMode === 'manual' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ✏️ Manual Build
        </button>
        <button
          onClick={() => setImportMode('json')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            importMode === 'json' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📄 Import JSON
        </button>
      </div>

      {/* JSON Import Mode */}
      {importMode === 'json' && (
        <div className="border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">Import from JSON</h2>
          <p className="text-sm text-gray-500 mb-4">Upload a JSON file or paste your agent config below</p>

          {/* File Upload */}
          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 cursor-pointer hover:border-gray-400 transition-colors mb-4">
            <span className="text-2xl">📁</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Click to upload .json file</p>
              <p className="text-xs text-gray-400 mt-0.5">or drag and drop</p>
            </div>
            <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
          </label>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <textarea
            rows={8}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none mb-4"
            placeholder={`{
  "title": "My Agent",
  "description": "What it does",
  "systemPrompt": "You are...",
  "category": "learning",
  "examplePrompts": ["prompt 1", "prompt 2"],
  "capabilities": ["can do this"],
  "pricingModel": "free",
  "price": 0
}`}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />

          {jsonError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{jsonError}</div>
          )}

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => handleJsonImport(jsonInput)}
              disabled={!jsonInput.trim()}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Import & Fill Form →
            </button>
            <button
              onClick={() => { setImportMode('manual'); setJsonInput(''); setJsonError(''); }}
              className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* JSON Format Guide */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Required fields:</p>
            <div className="space-y-1 mb-3">
              {[
                { field: 'title', desc: 'Agent name (string)' },
                { field: 'systemPrompt', desc: 'Agent behavior (string) — or use externalApiUrl' },
              ].map((f) => (
                <div key={f.field} className="flex gap-2 text-xs">
                  <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono">{f.field}</code>
                  <span className="text-gray-500">{f.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-gray-700 mb-2">Optional fields:</p>
            <div className="space-y-1">
              {[
                { field: 'description', desc: 'string' },
                { field: 'category', desc: 'learning | coding | career | research | productivity | creative' },
                { field: 'examplePrompts', desc: 'array of strings' },
                { field: 'capabilities', desc: 'array of strings' },
                { field: 'tags', desc: 'array or comma-separated string' },
                { field: 'pricingModel', desc: 'free | freemium | one-time | monthly | yearly' },
                { field: 'price', desc: 'number (₹) for one-time' },
                { field: 'monthlyPrice', desc: 'number (₹) for monthly' },
                { field: 'yearlyPrice', desc: 'number (₹) for yearly' },
                { field: 'freeQueriesPerDay', desc: 'number — free queries per day (freemium)' },
                { field: 'freeQueriesPerMonth', desc: 'number — free queries per month (freemium)' },
                { field: 'externalApiUrl', desc: 'URL — your external agent API endpoint' },
              ].map((f) => (
                <div key={f.field} className="flex gap-2 text-xs">
                  <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono shrink-0">{f.field}</code>
                  <span className="text-gray-500">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Build Mode */}
      {importMode === 'manual' && (
        <>
          {/* Templates */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3">Start from a template:</p>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    const templateForm = {
                      ...BLANK_FORM,
                      ...t.form,
                      tags: Array.isArray(t.form.tags) ? t.form.tags.join(', ') : t.form.tags,
                    };
                    setForm(templateForm);
                    localStorage.setItem('agentDraft', JSON.stringify(templateForm));
                  }}
                  className="text-sm border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  {t.name}
                </button>
              ))}
              <button
                onClick={clearDraft}
                className="text-sm border border-dashed border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-all text-gray-400"
              >
                ✨ Blank
              </button>
            </div>
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
                <p className="text-xs text-gray-400 mb-2">
                  Your agent's API URL — we'll send POST requests with user messages
                </p>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                  value={form.externalApiUrl}
                  onChange={(e) => set('externalApiUrl', e.target.value)}
                  placeholder="https://your-agent-api.com/chat"
                />
                <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium mb-1">📡 Request format we'll send:</p>
                  <code className="text-xs text-blue-600 font-mono">
                    {`POST {url}\n{ "message": "user message", "history": [...] }`}
                  </code>
                  <p className="text-xs text-blue-700 font-medium mt-2 mb-1">📨 Expected response:</p>
                  <code className="text-xs text-blue-600 font-mono">
                    {`{ "reply": "your agent's response" }`}
                  </code>
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
                placeholder="e.g. DSA Mentor"
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
                placeholder="What does this agent help with?"
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

            {/* System Prompt — only for internal */}
            {form.agentType === 'internal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System prompt</label>
                <p className="text-xs text-gray-400 mb-2">Hidden instruction that defines your agent's behaviour</p>
                <textarea
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-mono"
                  value={form.systemPrompt}
                  onChange={(e) => set('systemPrompt', e.target.value)}
                  placeholder="You are a helpful DSA mentor..."
                />
              </div>
            )}

            {/* Example Prompts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Example prompts (shown to users)</label>
              {(form.examplePrompts || ['', '', '']).map((p, i) => (
                <input
                  key={i}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none mb-2"
                  value={p}
                  placeholder={`Example prompt ${i + 1}`}
                  onChange={(e) => {
                    const arr = [...(form.examplePrompts || ['', '', ''])];
                    arr[i] = e.target.value;
                    set('examplePrompts', arr);
                  }}
                />
              ))}
            </div>

            {/* Pricing Model — Flexible */}
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

              {/* Freemium options */}
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
                      type="number"
                      min="0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                      value={form.price}
                      onChange={(e) => set('price', Number(e.target.value))}
                      placeholder="e.g. 99"
                    />
                  </div>
                </div>
              )}

              {/* One-time price */}
              {form.pricingModel === 'one-time' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                    value={form.price}
                    onChange={(e) => set('price', Number(e.target.value))}
                    placeholder="e.g. 499"
                  />
                </div>
              )}

              {/* Monthly price */}
              {form.pricingModel === 'monthly' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monthly price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                    value={form.monthlyPrice}
                    onChange={(e) => set('monthlyPrice', Number(e.target.value))}
                    placeholder="e.g. 99"
                  />
                </div>
              )}

              {/* Yearly price */}
              {form.pricingModel === 'yearly' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Yearly price (₹)</label>
                  <input
                    type="number"
                    min="0"
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
                placeholder="DSA, algorithms, interview prep"
              />
            </div>

            {/* Capabilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capabilities</label>
              <p className="text-xs text-gray-400 mb-2">What can this agent do? (one per line)</p>
              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                placeholder={"Explains concepts step by step\nGives code examples\nAnswers follow-up questions"}
                value={form.capabilities?.join('\n') || ''}
                onChange={(e) => set('capabilities', e.target.value.split('\n').filter(Boolean))}
              />
            </div>

            {/* Submit buttons */}
            {!user?.isEmailVerified ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <p className="text-sm font-medium text-amber-800 mb-1">📧 Verify your email first</p>
                <p className="text-xs text-amber-600">Check your inbox for the verification link.</p>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handleSubmitForReview}
                  disabled={saving}
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}