import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EXPERTISE_OPTIONS = [
  'Finance & CA', 'Medical & Health', 'Education & Teaching',
  'Coding & Development', 'Career & HR', 'Legal', 
  'Marketing & Sales', 'Research & Academia', 'Other',
];

export default function ApplyCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    expertise: '',
    reason: '',
    portfolio: '',
    linkedin: '',
  });

  useEffect(() => {
    api.get('/creator-application/status')
      .then((res) => setStatus(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.expertise || !form.reason) {
      return setError('Expertise and reason are required.');
    }
    if (form.reason.length < 50) {
      return setError('Please write at least 50 characters in the reason field.');
    }

    setSubmitting(true);
    setError('');
    try {
      await api.post('/creator-application/apply', form);
      setSuccess(true);
      setStatus({ creatorStatus: 'pending' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20 text-gray-400">Loading...</div>;

  // Already a creator
  if (user?.role === 'creator') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">You're a Verified Creator!</h2>
        <p className="text-gray-500 mb-6">You already have creator access on SkillVerse.</p>
        <button
          onClick={() => navigate('/creator/dashboard')}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Go to Dashboard →
        </button>
      </div>
    );
  }

  // Pending
  if (status?.creatorStatus === 'pending' || success) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Application Under Review</h2>
        <p className="text-gray-500 mb-2">
          We've received your application. Our team will review it within 2-3 business days.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          We'll notify you via email once a decision is made.
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  // Rejected
  if (status?.creatorStatus === 'rejected') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Application Not Approved</h2>
        <p className="text-gray-500 mb-2">
          {status?.creatorApplication?.rejectionReason || 'Your application did not meet our creator criteria.'}
        </p>
        <p className="text-sm text-gray-400 mb-6">
          You can reapply after 30 days with more information.
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  // Application form
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full mb-4">
          🛠️ Creator Program
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Apply to Become a Creator</h1>
        <p className="text-gray-500">
          Share your expertise as an AI agent on SkillVerse. 
          Verified creators earn 80% of every sale.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: '💰', title: '80% Revenue', desc: 'Keep most of what you earn' },
          { icon: '🌍', title: 'Wide Reach', desc: 'Access thousands of users' },
          { icon: '✅', title: 'Verified Badge', desc: 'Build trust with users' },
        ].map((b) => (
          <div key={b.title} className="bg-gray-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">{b.icon}</div>
            <p className="text-sm font-medium text-gray-900">{b.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <div className="space-y-5">
        {/* Name — prefilled */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500"
            value={user?.name || ''}
            disabled
          />
        </div>

        {/* Email — prefilled */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500"
            value={user?.email || ''}
            disabled
          />
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area of Expertise <span className="text-red-400">*</span>
          </label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={form.expertise}
            onChange={(e) => setForm({ ...form, expertise: e.target.value })}
          >
            <option value="">Select your expertise</option>
            {EXPERTISE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Why do you want to create AI agents? <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Tell us about your expertise and what kind of agents you want to build. (min 50 characters)
          </p>
          <textarea
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            placeholder="e.g. I am a CA with 10 years of experience in tax planning. I want to build an agent that helps small businesses with GST filing and tax optimization..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">{form.reason.length} / 50 min characters</p>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Profile <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="https://linkedin.com/in/yourprofile"
            value={form.linkedin}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
          />
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio / Website / GitHub <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="https://yourwebsite.com"
            value={form.portfolio}
            onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
          />
        </div>

        {/* Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800 font-medium mb-1">📋 Review Process</p>
          <p className="text-xs text-amber-700">
            Applications are reviewed within 2-3 business days. 
            Once approved, you'll get full access to create and publish AI agents.
            Every agent also goes through a separate review before appearing on the marketplace.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Application →'}
        </button>
      </div>
    </div>
  );
}