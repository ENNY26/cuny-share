import { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import ProfileCard from '../components/ProfileCard';
import Badge from '../components/Badge';
import ChatModal from '../components/ChatModal';
import { 
  Plus, 
  Search, 
  Heart, 
  MapPin, 
  Filter, 
  SlidersHorizontal, 
  X, 
  Building2,
  Sparkles,
  Tag,
  Clock,
  Shield,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileIcon from '../components/ProfileIcon';

const NoteList = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Incoming messages for sellers: productId -> [messages]
  const [incomingByProduct, setIncomingByProduct] = useState({});
  const [viewIncomingFor, setViewIncomingFor] = useState(null);

  const observerRef = useRef();
  const searchInputRef = useRef();

  const categories = [
    { name: 'All', value: 'all', icon: '📦', color: 'from-gray-500 to-gray-600' },
    { name: 'Books', value: 'books', icon: '📚', color: 'from-amber-500 to-orange-500' },
    { name: 'Furniture', value: 'furniture', icon: '🪑', color: 'from-emerald-500 to-teal-500' },
    { name: 'Electronics', value: 'electronics', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { name: 'Bikes', value: 'bikes', icon: '🚲', color: 'from-green-500 to-emerald-500' },
    { name: 'Clothing', value: 'clothing', icon: '👕', color: 'from-pink-500 to-rose-500' },
    { name: 'Free Stuff', value: 'general', icon: '🎁', color: 'from-purple-500 to-indigo-500' }
  ];

  const schools = [
    'All Schools',
    'City College',
    'Hunter College',
    'Baruch College',
    'Brooklyn College',
    'Queens College',
    'Lehman College',
    'John Jay College',
    'York College',
    'Medgar Evers College',
    'College of Staten Island',
    'Bronx Community College',
    'Kingsborough Community College',
    'LaGuardia Community College',
    'Queensborough Community College'
  ];

  const fetchProducts = useCallback(async (p = 1, category = selectedCategory, school = selectedSchool) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: p.toString(),
        limit: '12'
      });
      
      if (searchQuery) params.append('q', searchQuery);
      if (category && category !== 'all') params.append('category', category);
      if (school && school !== 'all') params.append('school', school);

      const res = await axios.get(`/api/products?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const data = res.data;
      const items = Array.isArray(data.products) ? data.products : (data.products || []);
      
      if (p === 1) setProducts(items);
      else setProducts(prev => [...prev, ...items]);
      setHasMore(items.length >= 12);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      if (err.code === 'ERR_NETWORK' || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Cannot connect to server. Please make sure the backend is running.');
      } else {
        toast.error('Failed to load listings');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, searchQuery, selectedCategory, selectedSchool]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchProducts(1, selectedCategory, selectedSchool);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedSchool]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore) {
        setPage(p => p + 1);
      }
    }, { rootMargin: '200px' });
    if (observerRef.current) obs.observe(observerRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page, selectedCategory, selectedSchool);
  }, [page]);

  // Listen for incoming socket messages so sellers see interested buyers live
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket || !user) return;

    const handler = (message) => {
      try {
        const prodId = message.product?._id || message.product || message.relatedId;
        if (String(message.recipient) === String(user._id) && prodId) {
          setIncomingByProduct(prev => {
            const key = String(prodId);
            const arr = prev[key] ? [...prev[key]] : [];
            arr.unshift(message);
            return { ...prev, [key]: arr };
          });
          toast.info(`New inquiry on your listing: ${message.text?.slice(0, 80)}`);
        }
      } catch (err) {
        console.error('incoming message handler error', err);
      }
    };

    socket.on('new_message', handler);
    return () => {
      socket.off('new_message', handler);
    };
  }, [socket, user]);

  const toggleFavorite = async (id, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFav = new Set(prev);
      if (newFav.has(id)) {
        newFav.delete(id);
        toast.info('Removed from favorites');
      } else {
        newFav.add(id);
        toast.success('Added to favorites');
      }
      return newFav;
    });
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const openMessageModal = (product) => {
    setSelectedProduct(product);
    setMessageContent(`Hi, I'm interested in your "${product.title}". Is it still available?`);
    setShowMessageModal(true);
  };

  // Open a small modal showing incoming buyer messages for this product (seller view)
  const openIncomingModal = (productId) => {
    setViewIncomingFor(productId);
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedProduct) return;
    const sellerId = selectedProduct.seller?._id || selectedProduct.seller;
    if (!sellerId) {
      toast.error('Seller not available for messaging');
      return;
    }
    try {
      setMessageLoading(true);
      await axios.post('/api/messages', {
        recipient: sellerId,
        text: messageContent,
        product: selectedProduct._id
      });
      toast.success('Message sent!');
      setShowMessageModal(false);
      setMessageContent('');
    } catch (err) {
      console.error('Send message error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setMessageLoading(false);
    }
  };

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Enhanced Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-white/20 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Campus Marketplace
              </h1>
              <p className="text-xs text-gray-500">Trusted by students across campuses</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
              className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Messages"
            >
              <MessageSquare size={22} />
            </button>
            <button
              onClick={() => navigate('/upload-note')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              List Item
            </button>
            <ProfileIcon />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-12">
        {/* Hero Search Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Find Your Campus
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Treasures
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover amazing deals from trusted students across campuses. Everything you need, right here.
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : 'scale-100'}`}>
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={24} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search textbooks, furniture, electronics, bikes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-16 pr-6 py-4 text-lg border-2 border-white bg-white/80 backdrop-blur-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-xl transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {/* Quick Search Tags */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Textbooks', 'iPhone', 'Bike', 'Desk', 'Free'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickSearch(tag)}
                  className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 hover:bg-white hover:shadow-lg border border-white/40 transition-all hover:scale-105"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="text-green-500" size={16} />
              <span>Verified Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500" size={16} />
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-purple-500" size={16} />
              <span>Best Prices</span>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium ${
                showFilters 
                  ? 'bg-blue-50 border-blue-500 text-blue-600' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500'
              }`}
            >
              <SlidersHorizontal size={18} />
              Filters
              {(selectedCategory !== 'all' || selectedSchool !== 'all') && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Enhanced Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.value
                    ? `bg-gradient-to-br ${category.color} text-white shadow-2xl`
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-white shadow-lg hover:shadow-xl'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-semibold text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 mb-8 animate-in slide-in-from-top">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Campus</label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                >
                  {schools.map(school => (
                    <option key={school} value={school === 'All Schools' ? 'all' : school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory !== 'all' || selectedSchool !== 'all' || searchQuery
                  ? 'Featured Listings'
                  : 'All Listings'}
              </h2>
              <p className="text-gray-600 mt-1">
                {searchQuery && `Search results for "${searchQuery}"`}
                {!searchQuery && selectedCategory !== 'all' && `Showing ${selectedCategory} items`}
                {!searchQuery && selectedCategory === 'all' && 'Discover amazing campus deals'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-6 bg-gray-300 rounded w-1/2" />
                    <div className="h-3 bg-gray-300 rounded w-full" />
                    <div className="flex justify-between items-center pt-3">
                      <div className="h-8 w-8 bg-gray-300 rounded-full" />
                      <div className="h-4 bg-gray-300 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="text-blue-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery || selectedCategory !== 'all' || selectedSchool !== 'all' 
                    ? 'No items found' 
                    : 'Marketplace is empty'}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {searchQuery || selectedCategory !== 'all' || selectedSchool !== 'all'
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'Be the first to list an item and start the campus marketplace!'}
                </p>
                {(!searchQuery && selectedCategory === 'all' && selectedSchool === 'all') && (
                  <button
                    onClick={() => navigate('/upload-note')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    List Your First Item
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        key={`${product._id}-${product.updatedAt || product.createdAt}`}
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const img = e.target;
                          const src = img.src;
                          // Try cache-busting first if it's not a placeholder
                          if (!src.includes('unsplash.com') && !src.includes('?v=') && !src.includes('&v=')) {
                            const separator = src.includes('?') ? '&' : '?';
                            img.src = `${src}${separator}v=${Date.now()}`;
                          } else {
                            // Fallback to placeholder
                            img.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(product._id, e)}
                        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
                          favorites.has(product._id)
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          size={20} 
                          className={favorites.has(product._id) ? 'fill-current' : ''} 
                        />
                      </button>
                      
                      {/* Category Badge */}
                      {product.category && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <Tag size={12} />
                          {product.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {product.title}
                      </h3>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        ${product.price || 0}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-blue-500" />
                          <span className="font-medium">{product.seller?.school || 'Campus'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Filter size={16} />
                          <span className="capitalize">{product.condition || 'Good'}</span>
                        </div>
                      </div>

                      {product.seller && (
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {product.seller.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {product.seller.username || 'Seller'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {product.seller.school || 'Campus Student'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openMessageModal(product);
                              }}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                              title="Message seller"
                            >
                              <MessageSquare size={16} />
                            </button>
                            {/* If there are incoming messages for this product (seller view), show indicator */}
                            {incomingByProduct[String(product._id)] && incomingByProduct[String(product._id)].length > 0 && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openIncomingModal(String(product._id)); }}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                                  title="View inquiries"
                                >
                                  {incomingByProduct[String(product._id)].length}
                                </button>
                              </div>
                            )}
                            <Badge badge={product.seller.badge} size="sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll elements */}
              <div ref={observerRef} className="h-8" />

              {loadingMore && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 font-medium">Loading more amazing deals...</p>
                  </div>
                </div>
              )}

              {!hasMore && filteredProducts.length > 0 && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="text-green-600" size={24} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">You've seen it all!</h4>
                    <p className="text-gray-600">
                      That's everything we have for now. Check back later for new listings!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Message Seller</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You're messaging the seller of: <strong>{selectedProduct?.title}</strong>
                </p>
              </div>

              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Write your message to the seller..."
                className="w-full h-40 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={!messageContent.trim() || messageLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {messageLoading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming inquiries modal (seller) - reuse ChatModal */}
      {viewIncomingFor && (
        (() => {
          const prod = products.find(p => String(p._id) === String(viewIncomingFor));
          if (!prod) return null;
          return (
            <ChatModal
              product={prod}
              user={user}
              token={token}
              onClose={() => setViewIncomingFor(null)}
            />
          );
        })()
      )}
    </div>
  );
};

export default NoteList;