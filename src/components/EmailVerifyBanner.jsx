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
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 text-lg shrink-0">📧</span>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Verify your email to create agents and make payments
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Check your inbox — some features are restricted until verified
            </p>
          </div>
        </div>
        {sent ? (
          <span className="text-xs text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-full shrink-0">
            ✓ Email sent!
          </span>
        ) : (
          <button
            onClick={resend}
            disabled={loading}
            className="text-xs font-medium text-amber-800 border border-amber-300 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-40 shrink-0 whitespace-nowrap"
          >
            {loading ? 'Sending...' : 'Resend email'}
          </button>
        )}
      </div>
    </div>
  );
}