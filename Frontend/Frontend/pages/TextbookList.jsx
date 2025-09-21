import { useEffect, useState } from 'react';
import axios from '../src/api/axios';
import { toast } from 'react-toastify';
import { Download, MessageSquare, Eye, User, BookOpen, DollarSign, Calendar, X, Send, Mail } from 'lucide-react';

const TextbookList = () => {
  const token = localStorage.getItem('token');
  const [userEmail, setUserEmail] = useState('');

  const [textbooks, setTextbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Email modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    // Fetch user data including email
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get('/api/user/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setUserEmail(userRes.data.email);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

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

    if (token) {
      fetchUserData();
    }
    fetchTextbooks();
  }, [token]);

  const openEmailModal = (book) => {
    setSelectedBook(book);
    setEmailContent(`Hello, I'm interested in your textbook "${book.title}" listed on the marketplace.`);
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    if (!selectedBook || !emailContent.trim()) {
      toast.error('Please write a message');
      return;
    }

    try {
      setEmailLoading(true);
      
      // Get the uploader's email
      const uploaderId = selectedBook.uploader?._id || selectedBook.uploader;
      const uploaderRes = await axios.get(`/api/user/${uploaderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const uploaderEmail = uploaderRes.data.email;
      
      // Send email via your backend
      await axios.post('/api/send-email', {
        to: uploaderEmail,
        from: userEmail,
        subject: `Inquiry about: ${selectedBook.title}`,
        text: emailContent,
        textbookId: selectedBook._id,
        textbookTitle: selectedBook.title
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Email sent successfully!');
      setShowEmailModal(false);
      setEmailContent('');
    } catch (err) {
      console.error('Send email error:', err);
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  const filteredTextbooks = textbooks.filter(book => {
    if (selectedCategory === 'all') return true;
    return book.category === selectedCategory;
  });

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

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
      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Textbook Marketplace</h1>
        <div className="flex flex-wrap gap-4">
          {/* Category filter */}
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

          {/* Sort filter */}
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
        </div>
      </div>

      {/* Textbook List */}
      <div>
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
                      onClick={() => openEmailModal(book)}
                      className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      <Mail size={16} className="mr-1" />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Contact Seller</h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You're contacting the seller of: <strong>{selectedBook.title}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Your message will be sent from: <strong>{userEmail}</strong>
                </p>
              </div>
              
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Write your message to the seller..."
                className="w-full h-40 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                disabled={!emailContent.trim() || emailLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextbookList;