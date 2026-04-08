import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-6">
            We sent a password reset link to <strong>{email}</strong>. Check your inbox!
          </p>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Forgot password?</h1>
          <p className="text-gray-500 text-sm">Enter your email and we'll send a reset link.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}