import { useEffect, useState } from 'react';
import axios from '../src/api/axios';
import { toast } from 'react-toastify';
import { Download, MessageSquare, Eye, User, BookOpen, DollarSign, Calendar, X, Send } from 'lucide-react';

const TextbookList = () => {
  const [textbooks, setTextbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchTextbooks = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/textbook');
        
        if (Array.isArray(res.data)) {
          setTextbooks(res.data);
        } else if (res.data.textbooks && Array.isArray(res.data.textbooks)) {
          setTextbooks(res.data.textbooks);
        } else {
          setTextbooks([]);
          toast.info("No textbooks available yet");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch textbooks");
        setTextbooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTextbooks();
  }, []);

  // Fetch conversations when chat is opened
  useEffect(() => {
    if (showChat) {
      fetchConversations();
    }
  }, [showChat]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // This would be your API endpoint to get user's conversations
      const res = await axios.get('/api/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error("Fetch conversations error:", err);
      toast.error("Failed to load conversations");
    }
  };

  const fetchMessages = async () => {
    try {
      setChatLoading(true);
      const { textbookId, userId } = selectedConversation;
      const res = await axios.get(`/api/messages?userId=${userId}&textbookId=${textbookId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch messages error:", err);
      toast.error("Failed to load messages");
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const { textbookId, userId } = selectedConversation;
      const res = await axios.post('/api/messages', {
        recipient: userId,
        textbook: textbookId,
        text: newMessage
      });
      
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Failed to send message");
    }
  };

  const startConversation = (book) => {
    setSelectedConversation({
      textbookId: book._id,
      userId: book.uploader,
      textbookTitle: book.title,
      userName: book.uploaderUsername || 'Seller'
    });
    setShowChat(true);
  };

  // Filter textbooks by category
  const filteredTextbooks = textbooks.filter(book => {
    if (selectedCategory === 'all') return true;
    return book.category === selectedCategory;
  });

  // Sort textbooks
  const sortedTextbooks = [...filteredTextbooks].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    return 0;
  });

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-4 shadow rounded-lg animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header and Filters */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Textbook Marketplace</h1>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">Category:</label>
            <select 
              id="category"
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="literature">Literature</option>
              <option value="business">Business</option>
              <option value="programming">Programming</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
            <select 
              id="sort"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare size={18} className="mr-2" />
            Messages {conversations.length > 0 && `(${conversations.length})`}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Textbook List */}
        <div className={`${showChat ? 'w-2/3' : 'w-full'}`}>
          {sortedTextbooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No textbooks found</h3>
              <p className="text-gray-500">Try selecting a different category or check back later.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedTextbooks.map((book) => (
                <div key={book._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Book Image */}
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    {book.fileType === 'image' ? (
                      <img 
                        src={book.fileUrl} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <div className="text-center p-4">
                          <BookOpen size={48} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">{book.fileType.toUpperCase()} File</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Condition badge */}
                    {book.condition && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {book.condition}
                      </span>
                    )}
                  </div>
                  
                  {/* Book Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author || 'Unknown Author'}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <User size={14} className="mr-1" />
                      <span>{book.uploaderUsername || 'Anonymous'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-green-600 font-bold">
                        <DollarSign size={16} />
                        <span>{formatPrice(book.price)}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>{formatDate(book.createdAt)}</span>
                      </div>
                    </div>
                    
                    {book.edition && (
                      <p className="text-sm text-gray-600 mb-2">Edition: {book.edition}</p>
                    )}
                    
                    {book.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{book.description}</p>
                    )}
                    
                    {book.isFlexible && (
                      <p className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-block mb-3">
                        Open to Flexible Exchange
                      </p>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <a
                        href={book.fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </a>
                      
                      <button
                        onClick={() => startConversation(book)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        <MessageSquare size={16} className="mr-1" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-1/3 bg-white rounded-lg shadow-md h-[calc(100vh-200px)] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Messages</h3>
              <button 
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conversations List */}
            {!selectedConversation ? (
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No conversations yet. Start a conversation by clicking "Contact" on a textbook.
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map(conversation => (
                      <div 
                        key={conversation._id} 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedConversation({
                          textbookId: conversation.textbook._id,
                          userId: conversation.participants.find(p => p._id !== req.user._id)._id,
                          textbookTitle: conversation.textbook.title,
                          userName: conversation.participants.find(p => p._id !== req.user._id).username
                        })}
                      >
                        <div className="font-medium">{conversation.textbook.title}</div>
                        <div className="text-sm text-gray-500">With {conversation.participants.find(p => p._id !== req.user._id).username}</div>
                        {conversation.lastMessage && (
                          <div className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage.text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Chat Messages */
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center">
                  <button 
                    onClick={() => setSelectedConversation(null)}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                  <div>
                    <div className="font-medium">{selectedConversation.textbookTitle}</div>
                    <div className="text-sm text-gray-500">With {selectedConversation.userName}</div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {chatLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div 
                          key={message._id} 
                          className={`flex ${message.sender._id === req.user._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs px-4 py-2 rounded-lg ${message.sender._id === req.user._id 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-white border border-gray-200 text-gray-800'}`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 ${message.sender._id === req.user._id ? 'text-indigo-200' : 'text-gray-500'}`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextbookList;