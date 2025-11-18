import React, { useState, useEffect, useRef } from 'react';
import axios from '../src/api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { X, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const ChatModal = ({ product, user, token, onClose }) => {
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();
  const [text, setText] = useState(`Hi, I'm interested in your "${product.title}". Is it still available?`);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const recipientId = product.seller?._id || product.seller;

  useEffect(() => {
    if (recipientId && product._id) {
      loadMessages();
    }
  }, [recipientId, product._id]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        if (
          (message.sender._id === recipientId || message.recipient === recipientId) &&
          (message.product === product._id || message.product?._id === product._id)
        ) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      socket.on('message_sent', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        socket.off('new_message');
        socket.off('message_sent');
      };
    }
  }, [socket, recipientId, product._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/messages?userId=${recipientId}&productId=${product._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error('Load messages error', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      if (socket && socket.connected) {
        // Use real-time socket
        socket.emit('send_message', {
          recipient: recipientId,
          text: text.trim(),
          product: product._id
        });
        setText('');
      } else {
        // Fallback to REST API
        const payload = {
          recipient: recipientId,
          text: text.trim(),
          product: product._id
        };
        await axios.post('/api/messages', payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setText('');
        toast.success('Message sent');
        loadMessages();
      }
    } catch (err) {
      console.error('Send message error', err);
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <div className="font-semibold">{product.sellerUsername || product.seller?.username || 'Seller'}</div>
            <div className="text-xs text-gray-500">Message about: {product.title}</div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900"><X size={20} /></button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => {
              const isOwn = String(msg.sender?._id || msg.sender) === String(currentUser?._id);
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              className="flex-1 border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;