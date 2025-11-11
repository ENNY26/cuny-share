import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ChatModal from '../components/ChatModal';
import { Heart, Bookmark, Edit, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProduct(res.data);
        setLiked(Boolean(res.data?.likes?.some(l => String(l) === String(user?._id))));
      } catch (err) {
        console.error('Load product error', err);
        toast.error('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6">Listing not found</div>;

  const isOwner = String(product.seller?._id || product.seller) === String(user?._id);

  const handleLike = async () => {
    if (!token) { toast.info('Please login to like'); return; }
    try {
      setLiked(prev => !prev);
      const res = await axios.post(`/api/products/${product._id}/like`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.liked !== undefined) setLiked(res.data.liked);
    } catch (err) {
      console.error('Like error', err);
      toast.error('Failed to like');
    }
  };

  const handleSave = async () => {
    if (!token) { toast.info('Please login to save'); return; }
    try {
      setSaving(true);
      await axios.post(`/api/products/${product._id}/save`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      toast.success('Saved');
    } catch (err) {
      console.error('Save error', err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;
    try {
      await axios.delete(`/api/products/${product._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      toast.success('Listing deleted');
      navigate('/');
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete');
    }
  };

  const handleEdit = () => {
    navigate(`/product/edit/${product._id}`, { state: { product } });
  };

  const imgs = product.images && product.images.length ? product.images : [product.image || ''];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button className="mb-4 text-sm text-gray-600 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images / carousel */}
          <div className="relative bg-black/5">
            {imgs[imgIndex] ? (
              <img src={imgs[imgIndex]} alt={product.title} className="w-full h-[420px] object-cover" />
            ) : (
              <div className="w-full h-[420px] flex items-center justify-center bg-gray-100 text-gray-400">No image</div>
            )}

            {imgs.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
                  onClick={() => setImgIndex(i => (i - 1 + imgs.length) % imgs.length)}
                >
                  <ChevronLeft />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
                  onClick={() => setImgIndex(i => (i + 1) % imgs.length)}
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{product.title}</h1>
                <p className="text-lg text-green-700 font-semibold mb-3">${product.price ?? 0}</p>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Category:</strong> {product.category || 'General'}</div>
                  <div><strong>Condition:</strong> {product.condition || 'Used'}</div>
                  <div><strong>Location:</strong> {product.location || 'Campus'}</div>
                  <div><strong>Posted:</strong> {new Date(product.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button onClick={handleLike} className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-700'}`}>
                  <Heart /> {liked ? 'Liked' : 'Like'}
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 text-gray-700">
                  <Bookmark /> Save
                </button>
                {isOwner && (
                  <>
                    <button onClick={handleEdit} className="flex items-center gap-2 text-yellow-600">
                      <Edit /> Edit
                    </button>
                    <button onClick={handleDelete} className="flex items-center gap-2 text-red-600">
                      <Trash2 /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Seller info */}
            <div className="mt-6 border-t pt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
                  {product.sellerUsername?.charAt(0)?.toUpperCase() || (product.seller?.username?.charAt(0) || 'S')}
                </div>
                <div>
                  <div className="font-semibold">{product.sellerUsername || product.seller?.username || 'Seller'}</div>
                  <div className="text-sm text-gray-500">{product.seller?.school || product.sellerSchool || 'CUNY'}</div>
                  <div className="text-sm text-gray-500">{product.sellerEmail || product.seller?.email || ''}</div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowChat(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Message Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChat && (
        <ChatModal
          product={product}
          user={user}
          token={token}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;