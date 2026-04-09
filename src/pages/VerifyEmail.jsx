import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">📧</div>
        <p className="text-gray-500">Verifying your email...</p>
      </div>
    </div>
  );

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        <Link to="/" className="text-sm text-gray-900 hover:underline">← Go home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
        <p className="text-gray-500 mb-6">Your account is now fully activated.</p>
        <Link
          to="/marketplace"
          className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors inline-block"
        >
          Go to Marketplace →
        </Link>
      </div>
    </div>
  );
}