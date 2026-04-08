import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || password !== confirm) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password reset!</h2>
          <p className="text-gray-500 mb-2">Your password has been updated successfully.</p>
          <p className="text-sm text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Set new password</h1>
          <p className="text-gray-500 text-sm">Choose a strong password for your account.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !password || !confirm}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}