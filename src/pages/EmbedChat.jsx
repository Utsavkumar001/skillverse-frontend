import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import ChatMessage from '../components/ChatMessage';

export default function EmbedChat() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestId] = useState(() => 'guest_' + Math.random().toString(36).slice(2));
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/agents/${agentId}`).then((res) => setAgent(res.data));
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
      const { data } = await api.post(`/chat/${agentId}/embed`, {
        message: input,
        history: messages,
        guestId,
      });
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Something went wrong. Try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {agent?.title?.charAt(0) || 'A'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{agent?.title || '...'}</p>
          <p className="text-xs text-gray-400">Powered by SkillVerse</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center pt-8">
            <p className="text-gray-400 text-sm">{agent?.description}</p>
            {agent?.examplePrompts?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {agent.examplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(p)}
                    className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 shrink-0">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            ↑
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">Powered by SkillVerse</p>
      </div>
    </div>
  );
}