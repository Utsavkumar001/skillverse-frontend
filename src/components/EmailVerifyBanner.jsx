import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function EmailVerifyBanner() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.isEmailVerified) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
      <p className="text-sm text-amber-800">
        📧 Please verify your email to unlock all features.
      </p>
      {sent ? (
        <span className="text-xs text-amber-700 font-medium">Email sent! ✓</span>
      ) : (
        <button
          onClick={resend}
          disabled={loading}
          className="text-xs font-medium text-amber-800 border border-amber-300 px-3 py-1 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-40"
        >
          {loading ? 'Sending...' : 'Resend verification'}
        </button>
      )}
    </div>
  );
}