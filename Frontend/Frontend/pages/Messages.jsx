import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from '../src/api/axios';
import { toast } from 'react-toastify';
import ChatModal from '../components/ChatModal';

const Messages = () => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/conversations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (conv) => {
    setActiveConv(conv);
  };

  const getOtherParticipant = (conv) => {
    if (!user) return null;
    const other = conv.participants.find(p => p._id !== user._id && p._id !== user._id?.toString());
    return other || conv.participants.find(p => String(p._id) !== String(user._id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Messages</h2>

      {loading ? (
        <div className="text-gray-500">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className="text-gray-500">No conversations yet.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b font-semibold">Conversations</div>
            <div className="divide-y">
              {conversations.map(conv => {
                const other = getOtherParticipant(conv) || { username: 'Unknown' };
                const contextTitle = conv.product?.title || conv.textbook?.title || conv.note?.title || 'Listing';
                return (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className="w-full text-left p-3 hover:bg-gray-50 flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{other.username || other.username}</div>
                      <div className="text-xs text-gray-400">{new Date(conv.updatedAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-gray-600 truncate">{contextTitle} — {conv.lastMessage?.text || 'No messages yet'}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
            {activeConv ? (
              <div>
                {/* Build a product-like object for ChatModal */}
                <ChatModal
                  product={{
                    _id: activeConv.product?._id || activeConv.textbook?._id || activeConv.note?._id,
                    title: activeConv.product?.title || activeConv.textbook?.title || activeConv.note?.title,
                    seller: getOtherParticipant(activeConv)?._id || getOtherParticipant(activeConv),
                    sellerUsername: getOtherParticipant(activeConv)?.username || getOtherParticipant(activeConv)
                  }}
                  token={token}
                  onClose={() => setActiveConv(null)}
                />
              </div>
            ) : (
              <div className="text-gray-500">Select a conversation to start chatting.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
