import { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import ProfileCard from '../components/ProfileCard';
import { Plus, Search, Heart, MapPin, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoteList = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  const observerRef = useRef();

  const categories = [
    { name: 'Books', icon: '📚' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Bikes', icon: '🚲' },
    { name: 'Clothes', icon: '👕' },
    { name: 'Free Stuff', icon: '🎁' }
  ];

  const fetchProducts = useCallback(async (p = 1) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(`/api/products?page=${p}&limit=12`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = res.data;
      const items = Array.isArray(data.products) ? data.products : (data.products || []);
      if (p === 1) setProducts(items);
      else setProducts(prev => [...prev, ...items]);
      setHasMore(items.length >= 12);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

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
    fetchProducts(page);
  }, [page, fetchProducts]);

  const handleDeleteLocal = (id) => {
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFav = new Set(prev);
      if (newFav.has(id)) {
        newFav.delete(id);
      } else {
        newFav.add(id);
      }
      return newFav;
    });
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProfileCard />  {/* <- Add this at the top */}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CM</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Campus Marketplace</h1>
                  <p className="text-gray-600 text-sm">Buy and sell with fellow students</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  onClick={() => navigate('/upload-note')}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={20} />
                  List Item
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Listings {searchQuery && `- "${searchQuery}"`}
              </h2>
              <span className="text-gray-600 text-sm">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2" />
                      <div className="h-6 bg-gray-300 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-300 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No items found' : 'No listings yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery 
                      ? `No items matching "${searchQuery}" found. Try adjusting your search.`
                      : 'Be the first to list an item on your campus marketplace!'
                    }
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => navigate('/upload-note')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div className="relative">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                          alt={product.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product._id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full ${
                            favorites.has(product._id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-400 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <Heart 
                            size={18} 
                            className={favorites.has(product._id) ? 'fill-current' : ''} 
                          />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-lg font-bold text-blue-600 mb-2">${product.price}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{product.location || 'Campus'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Filter size={14} />
                            <span>{product.condition || 'Good'}</span>
                          </div>
                        </div>
                        
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Infinite scroll elements */}
                <div ref={observerRef} className="h-6" />

                {loadingMore && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-2">Loading more items...</p>
                  </div>
                )}

                {!hasMore && filteredProducts.length > 0 && (
                  <div className="text-center py-8 text-gray-500 border-t">
                    You've reached the end of the listings
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteList;