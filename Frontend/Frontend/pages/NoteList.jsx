import { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoteList = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef();

  const fetchProducts = useCallback(async (p = 1) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(`/api/products?page=${p}&limit=8`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = res.data;
      const items = Array.isArray(data.products) ? data.products : (data.products || []);
      if (p === 1) setProducts(items);
      else setProducts(prev => [...prev, ...items]);
      setHasMore(items.length >= 8);
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

  // infinite scroll: load more when sentinel visible
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-2">
          <h1 className="text-2xl font-bold">Campus Marketplace</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/upload-note')} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded">
              <Plus size={16} /> List Item
            </button>
          </div>
        </div>

        <main>
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse h-96" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-lg shadow">No listings yet</div>
          ) : (
            <div className="space-y-6 px-2">
              {products.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  user={user}
                  token={token}
                  onDeleted={handleDeleteLocal}
                />
              ))}

              <div ref={observerRef} className="h-6" />

              {loadingMore && (
                <div className="text-center py-6">Loading more...</div>
              )}

              {!hasMore && (
                <div className="text-center py-6 text-gray-500">End of listings</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NoteList;