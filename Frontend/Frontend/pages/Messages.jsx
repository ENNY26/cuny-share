import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Send, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const Messages = () => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        // Check if this message belongs to the current conversation
        if (selectedConversation) {
          const isRelevant = 
            (message.product && String(message.product) === String(selectedConversation.product?._id || selectedConversation.product)) ||
            (message.textbook && String(message.textbook) === String(selectedConversation.textbook?._id || selectedConversation.textbook)) ||
            (message.note && String(message.note) === String(selectedConversation.note?._id || selectedConversation.note));
          
          const isParticipant = 
            String(message.sender?._id || message.sender) === String(selectedConversation.participants.find(p => String(p._id) !== String(user._id))?._id) ||
            String(message.recipient) === String(selectedConversation.participants.find(p => String(p._id) !== String(user._id))?._id);

          if (isRelevant && isParticipant) {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          }
        }
        // Refresh conversations list to update last message
        loadConversations();
      });

      socket.on('message_sent', (message) => {
        if (selectedConversation) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
        loadConversations();
      });

      return () => {
        socket.off('new_message');
        socket.off('message_sent');
      };
    }
  }, [socket, selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/conversations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setConversations(res.data || []);
    } catch (err) {
      console.error('Load conversations error', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    try {
      setLoadingMessages(true);
      const otherParticipant = selectedConversation.participants.find(
        p => String(p._id) !== String(user._id)
      );
      
      if (!otherParticipant) {
        toast.error('Invalid conversation');
        return;
      }

      const params = new URLSearchParams();
      params.append('userId', otherParticipant._id);
      
      if (selectedConversation.product) {
        params.append('productId', selectedConversation.product._id || selectedConversation.product);
      } else if (selectedConversation.textbook) {
        params.append('textbookId', selectedConversation.textbook._id || selectedConversation.textbook);
      } else if (selectedConversation.note) {
        params.append('noteId', selectedConversation.note._id || selectedConversation.note);
      }

      const res = await axios.get(`/api/messages?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error('Load messages error', err);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedConversation) return;

    const otherParticipant = selectedConversation.participants.find(
      p => String(p._id) !== String(user._id)
    );

    if (!otherParticipant) {
      toast.error('Invalid conversation');
      return;
    }

    setSending(true);
    try {
      const payload = {
        recipient: otherParticipant._id,
        text: text.trim()
      };

      if (selectedConversation.product) {
        payload.product = selectedConversation.product._id || selectedConversation.product;
      } else if (selectedConversation.textbook) {
        payload.textbook = selectedConversation.textbook._id || selectedConversation.textbook;
      } else if (selectedConversation.note) {
        payload.note = selectedConversation.note._id || selectedConversation.note;
      }

      if (socket && socket.connected) {
        socket.emit('send_message', payload);
        setText('');
      } else {
        await axios.post('/api/messages', payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setText('');
        toast.success('Message sent');
        loadMessages();
        loadConversations();
      }
    } catch (err) {
      console.error('Send message error', err);
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getConversationTitle = (conv) => {
    const otherParticipant = conv.participants.find(
      p => String(p._id) !== String(user._id)
    );
    return otherParticipant?.username || 'Unknown User';
  };

  const getConversationContext = (conv) => {
    if (conv.product) {
      return `About: ${conv.product.title || 'Product'}`;
    } else if (conv.textbook) {
      return `About: ${conv.textbook.title || 'Textbook'}`;
    } else if (conv.note) {
      return `About: ${conv.note.title || 'Note'}`;
    }
    return 'Conversation';
  };

  const getLastMessagePreview = (conv) => {
    if (conv.lastMessage) {
      if (typeof conv.lastMessage === 'object' && conv.lastMessage.text) {
        return conv.lastMessage.text;
      }
    }
    return 'No messages yet';
  };

  const getConversationImage = (conv) => {
    if (conv.product?.images?.[0]) {
      return conv.product.images[0];
    } else if (conv.textbook?.images?.[0]) {
      return conv.textbook.images[0];
    } else if (conv.note?.images?.[0]) {
      return conv.note.images[0];
    }
    return null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view messages</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">View and respond to messages from buyers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Messages from interested buyers will appear here</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const otherParticipant = conv.participants.find(
                    p => String(p._id) !== String(user._id)
                  );
                  const isSelected = selectedConversation && String(selectedConversation._id) === String(conv._id);
                  const imageUrl = getConversationImage(conv);
                  
                  return (
                    <div
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                        isSelected ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={getConversationContext(conv)}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {otherParticipant?.username || 'Unknown'}
                            </p>
                            {conv.updatedAt && (
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(conv.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {getConversationContext(conv)}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {getLastMessagePreview(conv)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    {getConversationImage(selectedConversation) && (
                      <img
                        src={getConversationImage(selectedConversation)}
                        alt={getConversationContext(selectedConversation)}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getConversationTitle(selectedConversation)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getConversationContext(selectedConversation)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-400px)]">
                  {loadingMessages ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = String(msg.sender?._id || msg.sender) === String(user._id);
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
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

