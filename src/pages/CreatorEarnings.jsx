import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function CreatorEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/auth/earnings')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    if (!upiId || !amount) return;
    setSubmitting(true);
    try {
      const { data: res } = await api.post('/auth/withdraw', {
        amount: Number(amount),
        upiId,
      });
      setMessage(res.message);
      setData((prev) => ({ ...prev, walletBalance: res.newBalance }));
      setShowWithdraw(false);
      setAmount('');
      setUpiId('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/creator/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Creator Earnings</h1>
          <p className="text-sm text-gray-400">You earn 80% of every sale</p>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-gray-900 rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-1">Available Balance</p>
          <p className="text-4xl font-semibold text-gray-900">₹{data?.walletBalance?.toFixed(2) || '0.00'}</p>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={data?.walletBalance < 100}
            className="mt-4 w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {data?.walletBalance < 100 ? 'Min ₹100 to withdraw' : 'Withdraw →'}
          </button>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-1">Total Earned</p>
          <p className="text-4xl font-semibold text-gray-900">₹{data?.totalEarned?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-400 mt-4">Lifetime earnings on SkillVerse</p>
        </div>
      </div>

      {/* Revenue breakdown info */}
      <div className="border border-gray-200 rounded-2xl p-5 mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">Revenue Split</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your share</span>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-gray-100 rounded-full h-2">
                <div className="bg-gray-900 h-2 rounded-full" style={{ width: '80%' }} />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8">80%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Platform fee</span>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-gray-100 rounded-full h-2">
                <div className="bg-gray-300 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
              <span className="text-sm font-semibold text-gray-400 w-8">20%</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Example: Agent priced at ₹100 → You get ₹80, Platform keeps ₹20
        </p>
      </div>

      {/* Withdrawal History */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Withdrawal History</h2>
        {data?.withdrawalRequests?.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 text-sm">No withdrawals yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...(data?.withdrawalRequests || [])].reverse().map((req, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">₹{req.amount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {req.upiId} · {new Date(req.requestedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  req.status === 'paid' ? 'bg-green-50 text-green-700' :
                  req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {req.status === 'paid' ? '✓ Paid' :
                   req.status === 'rejected' ? '✗ Rejected' :
                   '⏳ Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Withdraw Earnings</h3>
            <p className="text-sm text-gray-500 mb-5">
              Available: ₹{data?.walletBalance?.toFixed(2)}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="100"
                  max={data?.walletBalance}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Min ₹100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 mb-5">
              Processed within 3-5 business days
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={submitting || !amount || !upiId}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}