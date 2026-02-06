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
  Home,
  User,
  LogOut,
  Package,
  MessageCircle,
  Settings,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileIcon from '../components/ProfileIcon';

const NoteList = () => {
  const { token, user, logout } = useAuth();
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
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const observerRef = useRef();
  const searchInputRef = useRef();
  const sideNavRef = useRef();

  // Close side nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideNavRef.current && !sideNavRef.current.contains(event.target)) {
        setIsSideNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Package, label: 'My Listings', path: '/my-listings' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
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
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-semibold rounded-full">
                      {product.category || 'General'}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 text-xs font-semibold rounded-full">
                      {product.condition || 'Used'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-gray-500 mb-4">
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

                <div className="flex flex-col items-start md:items-end gap-4">
                  <div className="text-left md:text-right">
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${product.price || 0}
                    </p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
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

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {product.seller?.username?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  {product.seller?.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Shield size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.seller?.username || 'Seller'}</p>
                  <p className="text-sm text-gray-600 truncate">{product.seller?.school || 'Campus Student'}</p>
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
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <img
            src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <button
            onClick={(e) => toggleFavorite(product._id, e)}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 z-10 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
          </button>
          
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-md rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Tag size={12} />
              {product.category || 'General'}
            </span>
          </div>

          {incomingCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); openIncomingModal(String(product._id)); }}
              className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg hover:shadow-xl transition-all hover:scale-105 z-10"
            >
              <Bell size={12} />
              {incomingCount}
            </button>
          )}

          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md rounded-full">
            <p className="text-base sm:text-lg font-bold text-white">${product.price || 0}</p>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {product.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">
            {product.description || 'No description available'}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              <span className="font-medium truncate">{product.seller?.school || 'Campus'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span className="capitalize">{product.condition || 'Good'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                {product.seller?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {product.seller?.verified && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
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
                className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
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
      {/* Mobile Side Navigation */}
      <div
        ref={sideNavRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSideNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Campus</h2>
                <p className="text-sm text-blue-600 font-semibold">Marketplace</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {user.username?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.username}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsSideNavOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Filters</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('books');
                    setIsSideNavOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <Tag size={14} />
                  Textbooks
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('electronics');
                    setIsSideNavOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <Zap size={14} />
                  Electronics
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('free');
                    setIsSideNavOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <Award size={14} />
                  Free Items
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                logout();
                setIsSideNavOpen(false);
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile nav */}
      {isSideNavOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsSideNavOpen(false)}
        />
      )}

      {/* Enhanced Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left: Hamburger and Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSideNavOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
              >
                <Menu size={24} />
              </button>
              
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
                <div className="text-left hidden sm:block">
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

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 md:hidden"
                title="Messages"
              >
                <MessageSquare size={20} />
              </button>
              
              <button
                onClick={() => navigate('/upload-note')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline">List Item</span>
                <span className="sm:hidden">List</span>
              </button>
              
              <div className="hidden md:block">
                <ProfileIcon />
              </div>
              
              {/* Mobile Profile Button */}
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
              >
                <User size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Search - Always visible on mobile */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-16">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 md:mb-3">
                Discover Campus Treasures
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl">
                Buy, sell, and trade with trusted students across campuses.
              </p>
            </div>
<<<<<<< HEAD
            </form>
          </div>
        )}
=======
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 md:gap-4">
              <div className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {products.length}+
                </div>
                <div className="text-xs md:text-sm text-gray-600">Active Listings</div>
              </div>
              <div className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-xs md:text-sm text-gray-600">Verified Sellers</div>
              </div>
            </div>
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
            <span className="text-xs md:text-sm text-gray-500 font-medium mr-2">Popular:</span>
            {['MacBook Pro', 'Textbooks', 'Bikes', 'Desk', 'iPhone', 'Free Items'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleQuickSearch(tag)}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-br from-white to-gray-50 rounded-full text-xs md:text-sm font-medium text-gray-700 hover:text-blue-600 hover:shadow-lg border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
>>>>>>> 0e9bd3fca4857b4d40a152ab455bb8ba1eed4759

        {/* Enhanced Categories - Responsive Grid */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
            <Sparkles className="text-yellow-500" size={20} />
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`group relative flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                  selectedCategory === category.value
                    ? `bg-gradient-to-br ${category.color} text-white shadow-xl md:shadow-2xl scale-105`
                    : `${category.bgColor} text-gray-700 hover:shadow-lg md:hover:shadow-xl border border-gray-100 hover:border-transparent`
                }`}
              >
                <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </span>
                <span className="font-semibold text-xs md:text-sm whitespace-nowrap">
                  {category.name}
                </span>
                {selectedCategory === category.value && (
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-1 h-1 md:w-2 md:h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar - Responsive Layout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="flex-1">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
              {searchQuery ? `"${searchQuery}"` : selectedCategory === 'all' ? 'All Listings' : categories.find(c => c.value === selectedCategory)?.name}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              {searchQuery 
                ? `Search results for "${searchQuery}"` 
                : selectedCategory !== 'all'
                  ? `Explore amazing ${selectedCategory} deals from campus`
                  : 'Discover the best deals from trusted students'
              }
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 md:p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-md md:shadow-lg text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 md:p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-md md:shadow-lg text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={18} />
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg md:rounded-xl pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer w-full md:w-auto"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all duration-300 ${
                showFilters || selectedSchool !== 'all'
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 text-blue-600 shadow-md md:shadow-lg'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
              {(selectedSchool !== 'all') && (
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl border border-gray-100/50 p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors"
              >
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" />
                  Campus
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                >
                  {schools.map(school => (
                    <option key={school} value={school === 'All Schools' ? 'all' : school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-green-500" />
                  Condition
                </label>
                <select className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base">
                  <option>All Conditions</option>
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" />
                  Price Range
                </label>
                <div className="flex items-center gap-2 md:gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
<<<<<<< HEAD
      </div>
=======

        {/* Products Grid/List */}
        <div>
          {loading ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" 
              : "space-y-4 md:space-y-6"
            }>
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="p-3 md:p-5 space-y-2 md:space-y-3">
                    <div className="h-3 md:h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 md:h-6 bg-gray-300 rounded w-1/2" />
                    <div className="h-2 md:h-3 bg-gray-300 rounded w-full" />
                    <div className="flex justify-between items-center pt-2 md:pt-3">
                      <div className="h-6 md:h-8 w-6 md:w-8 bg-gray-300 rounded-full" />
                      <div className="h-3 md:h-4 bg-gray-300 rounded w-12 md:w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 md:py-20 bg-gradient-to-br from-white to-gray-50/50 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl border border-gray-100/50">
              <div className="max-w-md mx-auto px-4">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                  <Search className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                  No items found
                </h3>
                <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                  {searchQuery 
                    ? `No results for "${searchQuery}". Try different keywords.`
                    : 'No listings available at the moment. Be the first to list an item!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <button
                    onClick={() => navigate('/upload-note')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base"
                  >
                    List Your First Item
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedSchool('all');
                    }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 px-6 md:px-8 py-2.5 md:py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold border border-gray-200 text-sm md:text-base"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" 
                : "space-y-4 md:space-y-6"
              }>
                {products.map(renderProductCard)}
              </div>

              <div ref={observerRef} className="h-6 md:h-8 mt-6 md:mt-8" />

              {loadingMore && (
                <div className="text-center py-8 md:py-12">
                  <div className="inline-flex items-center gap-3 md:gap-4 bg-gradient-to-br from-white to-gray-50/50 rounded-xl md:rounded-2xl px-6 md:px-8 py-3 md:py-4 shadow-lg">
                    <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-600"></div>
                    <p className="text-gray-700 font-medium text-sm md:text-base">Loading more deals...</p>
                  </div>
                </div>
              )}

              {!hasMore && products.length > 0 && (
                <div className="text-center py-8 md:py-12">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <Award className="text-green-600" size={20} />
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">You've reached the end!</h4>
                    <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                      That's all we have for now. Check back later for new listings!
                    </p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm md:text-base"
                    >
                      <ChevronDown className="rotate-180" size={14} />
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
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md border border-gray-100/50">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg">Message Seller</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Contact seller about: <span className="font-semibold">{selectedProduct?.title}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors"
              >
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {selectedProduct?.seller?.username?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{selectedProduct?.seller?.username || 'Seller'}</p>
                    <p className="text-xs md:text-sm text-gray-600">{selectedProduct?.seller?.school || 'Campus'}</p>
                  </div>
                </div>
              </div>

              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Write your message to the seller..."
                className="w-full h-32 md:h-40 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm md:text-base"
                rows={3}
              />
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-2 md:gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 rounded-lg md:rounded-xl font-semibold hover:bg-gray-100 transition-all border border-gray-200 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={!messageContent.trim() || messageLoading}
                className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
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
>>>>>>> 0e9bd3fca4857b4d40a152ab455bb8ba1eed4759
    </div>
  );
};

export default NoteList;