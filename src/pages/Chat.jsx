import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const FREE_TRIAL_LIMIT = 3;

export default function Chat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trialCount, setTrialCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [trialEnded, setTrialEnded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/agents/${agentId}`).then((res) => setAgent(res.data));

    api.get(`/chat/${agentId}/status`)
    .then((res) => {
      setIsPaid(res.data.isPaid);
      if (res.data.isPaid) setTrialEnded(false);
      setTrialCount(res.data.trialCount || 0);
    })
    .catch(() => {});
  }, [agentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post(`/chat/${agentId}`, {
        message: input,
        history: messages,
      });

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      setTrialCount(data.trialCount || 0);
      setIsPaid(data.isPaid || false);

      if (agent?.price === 0 && !data.isPaid && data.trialCount >= FREE_TRIAL_LIMIT) {
        setTrialEnded(true);
      }
    } catch (err) {
      if (err.response?.data?.trialEnded) {
        setTrialEnded(true);
        setMessages([...newMessages, {
          role: 'assistant',
          content: '⚠️ Your free trial has ended. Upgrade to continue chatting!'
        }]);
      } else {
        setMessages([...newMessages, {
          role: 'assistant',
          content: 'Something went wrong. Try again.'
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messagesLeft = FREE_TRIAL_LIMIT - trialCount;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto px-4">

      {/* Header */}
      <div className="py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/agent/${agentId}`}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            ←
          </Link>
          <div>
            <h1 className="font-semibold text-gray-900">{agent?.title || '...'}</h1>
            <p className="text-xs text-gray-400 capitalize">{agent?.category}</p>
          </div>
        </div>

        {/* Status badge */}
        {agent?.price === 0 ? (
  <span className="bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium">
    ✦ Free · Unlimited
  </span>
) : isPaid ? (
  <span className="bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium">
    ✓ Unlimited
  </span>
) : trialEnded ? (
  <span className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-1.5 rounded-full font-medium">
    Trial ended
  </span>
) : (
  <span className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium">
    {FREE_TRIAL_LIMIT - trialCount} free left
  </span>
)}
      </div>

      {/* Example prompts */}
      {messages.length === 0 && agent?.examplePrompts?.length > 0 && (
        <div className="py-6 shrink-0">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {agent.examplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setInput(p)}
                className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-10">
            <div className="text-4xl mb-3">🤖</div>
            <p className="font-medium text-gray-700">{agent?.title}</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">{agent?.description}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-gray-900 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Trial ended wall */}
      {trialEnded && !isPaid ? (
        <div className="border border-amber-200 bg-amber-50 rounded-2xl p-5 text-center mb-4 shrink-0">
          <p className="font-semibold text-amber-800 mb-1">Free trial ended</p>
          <p className="text-sm text-amber-600 mb-4">
            You've used all {FREE_TRIAL_LIMIT} free messages.
          </p>
          <button
            onClick={() => navigate(`/agent/${agentId}?upgrade=true`)}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Upgrade now →
          </button>
        </div>
      ) : (
        <div className="py-4 shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              rows={1}
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-40 transition-all"
              placeholder={trialEnded ? 'Trial ended' : 'Message...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={trialEnded}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || trialEnded}
              className="bg-gray-900 text-white w-11 h-11 rounded-2xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-all flex items-center justify-center shrink-0"
            >
              ↑
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}