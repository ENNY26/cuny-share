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
  MessageSquare,
  ChevronDown,
  Star,
  Zap,
  Award,
  Bell,
  ShoppingBag,
  Grid,
  List,
  Flame,
  Menu,
  X as XIcon
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
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [incomingByProduct, setIncomingByProduct] = useState({});
  const [viewIncomingFor, setViewIncomingFor] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const observerRef = useRef();
  const searchInputRef = useRef();

  const categories = [
    { name: 'All', value: 'all', icon: '📦', color: 'from-gray-500 to-gray-700', bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200' },
    { name: 'Books', value: 'books', icon: '📚', color: 'from-amber-500 to-orange-600', bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100' },
    { name: 'Furniture', value: 'furniture', icon: '🛋️', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-100' },
    { name: 'Electronics', value: 'electronics', icon: '💻', color: 'from-blue-500 to-cyan-600', bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-100' },
    { name: 'Bikes', value: 'bikes', icon: '🚲', color: 'from-green-500 to-emerald-600', bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100' },
    { name: 'Clothing', value: 'clothing', icon: '👕', color: 'from-pink-500 to-rose-600', bgColor: 'bg-gradient-to-br from-pink-50 to-rose-100' },
    { name: 'Free', value: 'general', icon: '🎁', color: 'from-purple-500 to-indigo-600', bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-100' },
    { name: 'Services', value: 'services', icon: '🔧', color: 'from-red-500 to-pink-600', bgColor: 'bg-gradient-to-br from-red-50 to-pink-100' }
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

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'price_low', label: 'Price: Low to High', icon: TrendingUp },
    { value: 'price_high', label: 'Price: High to Low', icon: TrendingUp },
    { value: 'trending', label: 'Trending', icon: Flame },
    { value: 'best_match', label: 'Best Match', icon: Star }
  ];

  const fetchProducts = useCallback(async (p = 1, category = selectedCategory, school = selectedSchool, sort = selectedSort) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: p.toString(),
        limit: '16'
      });
      
      if (searchQuery) params.append('q', searchQuery);
      if (category && category !== 'all') params.append('category', category);
      if (school && school !== 'all') params.append('school', school);
      if (sort && sort !== 'newest') params.append('sort', sort);

      const res = await axios.get(`/api/products?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const data = res.data;
      const items = Array.isArray(data.products) ? data.products : (data.products || []);
      
      if (p === 1) setProducts(items);
      else setProducts(prev => [...prev, ...items]);
      setHasMore(items.length >= 16);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, searchQuery, selectedCategory, selectedSchool, selectedSort]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchProducts(1, selectedCategory, selectedSchool, selectedSort);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedSchool, selectedSort]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(p => p + 1);
      }
    }, { threshold: 0.5 });
    if (observerRef.current) obs.observe(observerRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page, selectedCategory, selectedSchool, selectedSort);
  }, [page]);

  // Listen for incoming socket messages
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
          
          // Show notification with product title
          const product = products.find(p => String(p._id) === String(prodId));
          toast.info(
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold">New inquiry on your listing!</p>
                <p className="text-sm opacity-90">{product?.title || 'Your item'}</p>
              </div>
            </div>,
            { autoClose: 4000 }
          );
        }
      } catch (err) {
        console.error('incoming message handler error', err);
      }
    };

    socket.on('new_message', handler);
    return () => {
      socket.off('new_message', handler);
    };
  }, [socket, user, products]);

  const toggleFavorite = async (id, e) => {
    e.stopPropagation();
    const newFav = new Set(favorites);
    if (newFav.has(id)) {
      newFav.delete(id);
      toast.success(
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-red-500 fill-current" />
          <span>Removed from favorites</span>
        </div>
      );
    } else {
      newFav.add(id);
      toast.success(
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-red-500 fill-current" />
          <span>Added to favorites</span>
        </div>
      );
    }
    setFavorites(newFav);
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
      toast.success(
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-green-500" />
          <span>Message sent successfully!</span>
        </div>
      );
      setShowMessageModal(false);
      setMessageContent('');
    } catch (err) {
      console.error('Send message error:', err);
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    setPage(1);
  };

  const renderProductCard = (product) => {
    const isFavorite = favorites.has(product._id);
    const incomingCount = incomingByProduct[String(product._id)]?.length || 0;

    if (viewMode === 'list') {
      return (
        <div
          key={product._id}
          className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-64 h-64 overflow-hidden">
              <img
                src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
              
              {/* Favorite Button */}
              <button
                onClick={(e) => toggleFavorite(product._id, e)}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 z-10 ${
                  isFavorite
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
                }`}
              >
                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
              </button>

              {/* Incoming Messages Badge (for sellers) */}
              {incomingCount > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); openIncomingModal(String(product._id)); }}
                  className="absolute bottom-4 left-4 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg hover:shadow-xl transition-all hover:scale-105 z-10"
                >
                  <Bell size={12} />
                  {incomingCount} {incomingCount === 1 ? 'inquiry' : 'inquiries'}
                </button>
              )}
            </div>

            <div className="flex-1 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-semibold rounded-full">
                      {product.category || 'General'}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 text-xs font-semibold rounded-full">
                      {product.condition || 'Used'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500" />
                      <span>{product.seller?.school || 'Campus'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-purple-500" />
                      <span>{product.views || 0} views</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${product.price || 0}
                    </p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMessageModal(product);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg font-semibold hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Message
                    </button>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {product.seller?.username?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  {product.seller?.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Shield size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.seller?.username || 'Seller'}</p>
                  <p className="text-sm text-gray-600">{product.seller?.school || 'Campus Student'}</p>
                </div>
                <Badge badge={product.seller?.badge} size="md" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid View
    return (
      <div
        key={product._id}
        className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Favorite Button */}
          <button
            onClick={(e) => toggleFavorite(product._id, e)}
            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 z-10 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
          </button>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-md rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Tag size={12} />
              {product.category || 'General'}
            </span>
          </div>

          {/* Incoming Messages Badge (for sellers) */}
          {incomingCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); openIncomingModal(String(product._id)); }}
              className="absolute bottom-4 left-4 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg hover:shadow-xl transition-all hover:scale-105 z-10"
            >
              <Bell size={12} />
              {incomingCount} {incomingCount === 1 ? 'inquiry' : 'inquiries'}
            </button>
          )}

          {/* Price Overlay */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md rounded-full">
            <p className="text-lg font-bold text-white">${product.price || 0}</p>
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {product.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description || 'No description available'}
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

          {/* Seller Info */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                {product.seller?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {product.seller?.verified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Shield size={8} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {product.seller?.username || 'Seller'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {product.seller?.school || 'Campus Student'}
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
              <Badge badge={product.seller?.badge} size="sm" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/10">
      {/* Enhanced Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ShoppingBag className="text-white" size={22} />
                  </div>
                  <div className="absolute -inset-2 bg-blue-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                    Campus
                    <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Marketplace
                    </span>
                  </h1>
                </div>
              </button>
            </div>
            
            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search textbooks, furniture, electronics, bikes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 group"
                title="Messages"
              >
                <MessageSquare size={20} />
               
              </button>
              <button
                onClick={() => navigate('/upload-note')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>List Item</span>
              </button>
              <ProfileIcon />
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
                type="text"
                placeholder="Search campus marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-16 right-0 w-64 bg-white/95 backdrop-blur-xl border-l border-gray-100 shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col p-4 gap-2">
              {/* List Item Button */}
              <button
                onClick={() => {
                  navigate('/upload-note');
                  setMobileMenuOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>List Item</span>
              </button>

              {/* Messages Button */}
              <button
                onClick={() => {
                  navigate('/messages');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                <MessageSquare size={20} className="text-blue-600" />
                <span>Messages</span>
              </button>

              {/* Profile Section */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3">
                  <ProfileIcon />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user?.username || 'User'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user?.school || 'Campus'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mt-4 mb-3">
                Discover Campus Treasures
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Buy, sell, and trade with trusted students across campuses. Everything you need for campus life.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {products.length}+
                </div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
              <div className="px-4 py-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-sm text-gray-600">Verified Sellers</div>
              </div>
            </div>
          </div>

         
        </div>

        {/* Enhanced Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Sparkles className="text-yellow-500" size={24} />
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                  selectedCategory === category.value
                    ? `bg-gradient-to-br ${category.color} text-white shadow-2xl scale-105`
                    : `${category.bgColor} text-gray-700 hover:shadow-xl border border-gray-100 hover:border-transparent`
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </span>
                <span className="font-semibold text-sm whitespace-nowrap">
                  {category.name}
                </span>
                {selectedCategory === category.value && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {searchQuery ? `"${searchQuery}"` : selectedCategory === 'all' ? 'All Listings' : categories.find(c => c.value === selectedCategory)?.name}
            </h2>
            <p className="text-gray-600">
              {searchQuery 
                ? `Search results for "${searchQuery}"` 
                : selectedCategory !== 'all'
                  ? `Explore amazing ${selectedCategory} deals from campus`
                  : 'Discover the best deals from trusted students'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-lg text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-lg text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={20} />
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                showFilters || selectedSchool !== 'all'
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 text-blue-600 shadow-lg'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <SlidersHorizontal size={18} />
              Filters
              {(selectedSchool !== 'all') && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-2xl border border-gray-100/50 p-6 mb-8 animate-in slide-in-from-top">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" />
                  Campus
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {schools.map(school => (
                    <option key={school} value={school === 'All Schools' ? 'all' : school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-green-500" />
                  Condition
                </label>
                <select className="w-full px-4 py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                  <option>All Conditions</option>
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" />
                  Price Range
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 px-4 py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 px-4 py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        <div>
          {loading ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-6"
            }>
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden animate-pulse">
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
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-2xl border border-gray-100/50">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="text-blue-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No items found
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {searchQuery 
                    ? `No results for "${searchQuery}". Try different keywords.`
                    : 'No listings available at the moment. Be the first to list an item!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/upload-note')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    List Your First Item
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedSchool('all');
                    }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold border border-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-6"
              }>
                {products.map(renderProductCard)}
              </div>

              {/* Infinite scroll elements */}
              <div ref={observerRef} className="h-8 mt-8" />

              {loadingMore && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-4 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl px-8 py-4 shadow-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-gray-700 font-medium">Loading more amazing deals...</p>
                  </div>
                </div>
              )}

              {!hasMore && products.length > 0 && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Award className="text-green-600" size={24} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">You've reached the end!</h4>
                    <p className="text-gray-600 mb-6">
                      That's all we have for now. Check back later for new listings!
                    </p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      <ChevronDown className="rotate-180" size={16} />
                      Back to top
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100/50">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Message Seller</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Contact seller about: <span className="font-semibold">{selectedProduct?.title}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {selectedProduct?.seller?.username?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedProduct?.seller?.username || 'Seller'}</p>
                    <p className="text-sm text-gray-600">{selectedProduct?.seller?.school || 'Campus'}</p>
                  </div>
                </div>
              </div>

              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Write your message to the seller..."
                className="w-full h-40 px-4 py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                rows={4}
              />
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-5 py-2.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={!messageContent.trim() || messageLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {messageLoading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming inquiries modal */}
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