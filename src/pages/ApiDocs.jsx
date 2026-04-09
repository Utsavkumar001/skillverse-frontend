import { useState } from 'react';

const BASE_URL = 'https://skillverse-backend-t33t.onrender.com/api';

const endpoints = [
  {
    method: 'GET',
    path: '/agents',
    description: 'List all published agents',
    params: [
      { name: 'category', type: 'string', desc: 'Filter by category' },
      { name: 'search', type: 'string', desc: 'Search by title' },
      { name: 'sort', type: 'string', desc: 'popular | rating | newest' },
    ],
    example: `fetch('${BASE_URL}/agents?category=coding&sort=popular')`,
  },
  {
    method: 'GET',
    path: '/agents/:id',
    description: 'Get a single agent by ID',
    params: [],
    example: `fetch('${BASE_URL}/agents/AGENT_ID')`,
  },
  {
    method: 'POST',
    path: '/chat/:agentId/embed',
    description: 'Send a message to any agent (no auth required)',
    params: [
      { name: 'message', type: 'string', desc: 'User message (required)' },
      { name: 'history', type: 'array', desc: 'Previous messages [{role, content}]' },
    ],
    example: `fetch('${BASE_URL}/chat/AGENT_ID/embed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain recursion',
    history: []
  })
})`,
  },
  {
    method: 'POST',
    path: '/auth/register',
    description: 'Register a new user',
    params: [
      { name: 'name', type: 'string', desc: 'Full name' },
      { name: 'email', type: 'string', desc: 'Email address' },
      { name: 'password', type: 'string', desc: 'Min 6 characters' },
    ],
    example: `fetch('${BASE_URL}/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Utsav', email: 'u@example.com', password: 'pass123' })
})`,
  },
  {
    method: 'POST',
    path: '/auth/login',
    description: 'Login and get JWT token',
    params: [
      { name: 'email', type: 'string', desc: 'Registered email' },
      { name: 'password', type: 'string', desc: 'Password' },
    ],
    example: `fetch('${BASE_URL}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'u@example.com', password: 'pass123' })
})`,
  },
];

const METHOD_COLORS = {
  GET: 'bg-green-50 text-green-700 border-green-100',
  POST: 'bg-blue-50 text-blue-700 border-blue-100',
  PATCH: 'bg-amber-50 text-amber-700 border-amber-100',
  DELETE: 'bg-red-50 text-red-600 border-red-100',
};

export default function ApiDocs() {
  const [copied, setCopied] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full mb-4">
          🔌 Public API
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">SkillVerse API Docs</h1>
        <p className="text-gray-500">Integrate SkillVerse agents into your own apps. No auth needed for public endpoints.</p>
      </div>

      {/* Base URL */}
      <div className="border border-gray-200 rounded-2xl p-5 mb-8 bg-gray-50">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Base URL</p>
        <div className="flex items-center justify-between">
          <code className="text-sm text-gray-800 font-mono">{BASE_URL}</code>
          <button
            onClick={() => copy(BASE_URL, 'base')}
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-colors bg-white"
          >
            {copied === 'base' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {endpoints.map((ep, i) => (
          <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
            {/* Endpoint header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-gray-700">{ep.path}</code>
              </div>
              <p className="text-sm text-gray-500">{ep.description}</p>
            </div>

            {/* Params */}
            {ep.params.length > 0 && (
              <div className="p-5 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Parameters</p>
                <div className="space-y-2">
                  {ep.params.map((p, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm">
                      <code className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono shrink-0">
                        {p.name}
                      </code>
                      <span className="text-xs text-gray-400 shrink-0">{p.type}</span>
                      <span className="text-gray-500 text-xs">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example */}
            <div className="p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Example</p>
                <button
                  onClick={() => copy(ep.example, i)}
                  className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:border-gray-400 transition-colors bg-white"
                >
                  {copied === i ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-gray-600 font-mono overflow-x-auto whitespace-pre-wrap">
                {ep.example}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 border border-amber-100 bg-amber-50 rounded-2xl p-5">
        <p className="text-sm font-medium text-amber-800 mb-1">🔐 Authentication</p>
        <p className="text-sm text-amber-700">
          Protected endpoints require a Bearer token in the Authorization header.
          Get your token by calling <code className="bg-amber-100 px-1 rounded">/auth/login</code>.
        </p>
        <code className="block mt-2 text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-lg font-mono">
          Authorization: Bearer YOUR_JWT_TOKEN
        </code>
      </div>
    </div>
  );
}