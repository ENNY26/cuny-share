import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Image as ImageIcon, 
  Search, 
  MoreVertical, 
  CheckCircle,
  Clock,
  Shield,
  User,
  Home,
  ChevronRight,
  Paperclip,
  Smile,
  Video,
  Phone,
  Info,
  Star,
  Archive,
  Bell,
  Filter,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Zap,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'active'
  const [showOptions, setShowOptions] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
            
            // Show notification
            const otherParticipant = selectedConversation.participants.find(p => String(p._id) !== String(user._id));
            toast.info(
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">New message from {otherParticipant?.username || 'User'}</p>
                  <p className="text-xs opacity-75">{message.text?.substring(0, 50)}...</p>
                </div>
              </div>
            );
          }
        }
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
    return 'Direct Message';
  };

  const getLastMessagePreview = (conv) => {
    if (conv.lastMessage) {
      if (typeof conv.lastMessage === 'object' && conv.lastMessage.text) {
        return conv.lastMessage.text.length > 50 
          ? `${conv.lastMessage.text.substring(0, 50)}...` 
          : conv.lastMessage.text;
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

  const getOtherParticipant = (conv) => {
    return conv.participants.find(p => String(p._id) !== String(user._id));
  };

  const getConversationDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return messageDate.toLocaleDateString();
  };

  const getUnreadCount = () => {
    return conversations.filter(conv => !conv.lastMessage?.read).length;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    const matchesSearch = searchQuery === '' || 
      otherParticipant?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getConversationContext(conv).toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'unread') {
      return matchesSearch && !conv.lastMessage?.read;
    }
    if (filter === 'active') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return matchesSearch && new Date(conv.updatedAt) > yesterday;
    }
    return matchesSearch;
  });

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate file upload
    toast.info(`Uploading ${file.name}...`);
    // Implement actual upload logic here
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageSquare size={40} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign in to continue</h2>
          <p className="text-gray-600 mb-8">Please sign in to view your messages</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold border border-gray-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/10">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 group"
              >
                <ArrowLeft size={20} className="text-gray-600 group-hover:text-gray-900" />
              </button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-xs text-gray-500">Connect with buyers and sellers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => navigate('/')}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300"
                  title="Go Home"
                >
                  <Home size={20} />
                </button>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
              {/* Sidebar Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                    <p className="text-xs text-gray-500">{filteredConversations.length} conversations</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => navigate('/upload-note')}
                      className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                      title="New listing"
                    >
                      <MessageSquare size={18} />
                    </button>
                    {getUnreadCount() > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {getUnreadCount()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-12 pr-4 py-3 text-sm bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                
                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      filter === 'unread'
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Unread
                    {getUnreadCount() > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {getUnreadCount()}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                {loading ? (
                  <div className="space-y-4 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No conversations</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchQuery ? 'No matches found' : 'Start a conversation from a listing'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const otherParticipant = getOtherParticipant(conv);
                    const isSelected = selectedConversation && String(selectedConversation._id) === String(conv._id);
                    const imageUrl = getConversationImage(conv);
                    const isUnread = !conv.lastMessage?.read && conv.lastMessage?.sender?._id !== user._id;
                    
                    return (
                      <div
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`group p-4 border-b border-gray-100/50 cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
                            : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={getConversationContext(conv)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User size={20} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            {otherParticipant?.verified && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <Shield size={8} className="text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 truncate">
                                  {otherParticipant?.username || 'Unknown User'}
                                </p>
                                {isUnread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {getConversationDate(conv.updatedAt)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {getConversationContext(conv)}
                            </p>
                            
                            <p className={`text-xs truncate ${
                              isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'
                            }`}>
                              {getLastMessagePreview(conv)}
                            </p>
                          </div>

                          {/* Options */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowOptions(showOptions === conv._id ? null : conv._id);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        {/* Options Menu */}
                        {showOptions === conv._id && (
                          <div className="absolute right-4 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-10">
                            <button className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 rounded-t-xl">
                              <Archive size={14} />
                              Archive Chat
                            </button>
                            <button className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                              <Bell size={14} />
                              Mute Notifications
                            </button>
                            <button className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 rounded-b-xl">
                              <Trash2 size={14} />
                              Delete Chat
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden flex flex-col h-[calc(100vh-180px)]">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-5 border-b border-gray-100/50 bg-gradient-to-r from-white to-gray-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                              {getConversationImage(selectedConversation) ? (
                                <img
                                  src={getConversationImage(selectedConversation)}
                                  alt={getConversationContext(selectedConversation)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User size={20} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircle size={8} className="text-white" />
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {getConversationTitle(selectedConversation)}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600 font-medium">Online</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">
                                {getConversationContext(selectedConversation)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Phone size={18} />
                        </button>
                        <button className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Video size={18} />
                        </button>
                        <button className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Info size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-white to-gray-50/20">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                          <p className="text-gray-600">Loading messages...</p>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-sm">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={24} className="text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">No messages yet</h3>
                          <p className="text-gray-600 mb-6">Start the conversation by sending a message</p>
                          <button
                            onClick={() => setText("Hi, I'm interested in your item. Is it still available?")}
                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg font-medium hover:from-blue-100 hover:to-indigo-100 transition-all"
                          >
                            Try a sample message
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-center">
                          <span className="px-4 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 text-sm font-medium rounded-full">
                            {new Date(messages[0]?.createdAt).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        {messages.map((msg) => {
                          const isOwn = String(msg.sender?._id || msg.sender) === String(user._id);
                          const otherParticipant = getOtherParticipant(selectedConversation);
                          
                          return (
                            <div
                              key={msg._id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-3`}
                            >
                              {!isOwn && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 flex items-center justify-center">
                                  <User size={14} className="text-gray-500" />
                                </div>
                              )}
                              
                              <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${
                                isOwn
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <div className={`flex items-center gap-2 mt-2 ${
                                  isOwn ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  <span className="text-xs">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  {isOwn && (
                                    <>
                                      <CheckCircle size={12} className="fill-current" />
                                      <span className="text-xs">Delivered</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {isOwn && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200 flex-shrink-0 flex items-center justify-center">
                                  <User size={14} className="text-blue-600" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-white to-gray-50/30">
                    <div className="flex gap-3">
                      <button
                        onClick={handleFileUpload}
                        className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Paperclip size={20} />
                      </button>
                      <button className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Smile size={20} />
                      </button>
                      
                      <div className="flex-1 relative">
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          rows={1}
                          className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                          placeholder="Type your message here..."
                          style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept="image/*, .pdf, .doc, .docx"
                        />
                      </div>
                      
                      <button
                        onClick={handleSend}
                        disabled={sending || !text.trim()}
                        className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 ${
                          sending || !text.trim()
                            ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {sending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="max-w-md text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MessageSquare size={40} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Select a conversation</h2>
                    <p className="text-gray-600 mb-6">
                      Choose a conversation from the list to start messaging or view your chat history
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-green-500" />
                        <span>Verified users only</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-500" />
                        <span>Real-time chat</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;