import { useState } from 'react';
import api from '../api/axios';

export default function PaymentModal({ agent, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1 — order create karo
      const { data } = await api.post('/payment/create-order', {
        amount: agent.price,
        agentId: agent._id,
      });

      // Step 2 — Razorpay checkout open karo
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'SkillVerse',
        description: agent.title,
        order_id: data.orderId,
        handler: async (response) => {
          // Step 3 — verify payment
          const verify = await api.post('/payment/verify', response);
          if (verify.data.success) {
            await api.post(`/chat/${agent._id}/mark-paid`);
            onSuccess();
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#111827',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{agent.title}</h2>
            <p className="text-sm text-gray-500 capitalize mt-0.5">{agent.pricingModel} plan</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light"
          >
            ×
          </button>
        </div>

        {/* Price */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{agent.title}</span>
            <span className="font-semibold text-gray-900">₹{agent.price}</span>
          </div>
          {agent.pricingModel === 'monthly' && (
            <p className="text-xs text-gray-400 mt-1">Billed monthly · Cancel anytime</p>
          )}
        </div>

        {/* What you get */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">What you get:</p>
          <ul className="space-y-1.5">
            <li className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-green-500">✓</span> Unlimited messages with this agent
            </li>
            <li className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-green-500">✓</span> Chat history saved
            </li>
            <li className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-green-500">✓</span> Priority response speed
            </li>
          </ul>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Processing...' : `Pay ₹${agent.price}`}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Secured by Razorpay · Test mode
        </p>
      </div>
    </div>
  );
}