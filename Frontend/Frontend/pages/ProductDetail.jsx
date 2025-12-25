import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ChatModal from '../components/ChatModal';
import Badge from '../components/Badge';
import { 
  Heart, 
  Bookmark, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar,
  Tag,
  Shield,
  Star,
  Share2,
  MessageCircle,
  CheckCircle,
  Eye // <- added Eye import
} from 'lucide-react';

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
  const [imageLoading, setImageLoading] = useState(true);

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

  const isOwner = String(product?.seller?._id || product?.seller) === String(user?._id);

  const handleLike = async () => {
    if (!token) { 
      toast.info('Please login to like listings'); 
      return; 
    }
    try {
      setLiked(prev => !prev);
      const res = await axios.post(`/api/products/${product._id}/like`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.liked !== undefined) setLiked(res.data.liked);
      toast.success(liked ? 'Removed from likes' : 'Added to likes');
    } catch (err) {
      console.error('Like error', err);
      setLiked(prev => !prev);
      toast.error('Failed to like listing');
    }
  };

  const handleSave = async () => {
    if (!token) { 
      toast.info('Please login to save listings'); 
      return; 
    }
    try {
      setSaving(true);
      await axios.post(`/api/products/${product._id}/save`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      toast.success('Saved to your collection');
    } catch (err) {
      console.error('Save error', err);
      toast.error('Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/products/${product._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      toast.success('Listing deleted successfully');
      navigate('/notes'); // Go back to listings instead of home
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete listing');
    }
  };

  const handleEdit = () => {
    navigate(`/product/edit/${product._id}`, { state: { product } });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
        toast.success('Listing shared!');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const imgs = product?.images && product.images.length ? product.images : [product?.image || ''];

  // reset image loading state when switching images
  useEffect(() => {
    setImageLoading(true);
  }, [imgIndex, imgs.length]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-300 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-[500px] rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded-lg w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded-lg w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Tag className="text-red-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/notes')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
          >
            Browse Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
        >
          <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="font-medium">Back to listings</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden group">
              {imgs[imgIndex] ? (
                <>
                  <img 
                    key={`${product._id}-${imgIndex}-${product.updatedAt || product.createdAt}`}
                    src={imgs[imgIndex]} 
                    alt={product.title}
                    className={`w-full h-[480px] object-cover transition-opacity duration-500 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={() => setImageLoading(false)}
                    onError={(e) => {
                      const img = e.target;
                      const src = img.src;
                      if (!src.includes('?v=') && !src.includes('&v=')) {
                        const separator = src.includes('?') ? '&' : '?';
                        img.src = `${src}${separator}v=${Date.now()}`;
                      } else {
                        img.style.display = 'none';
                        setImageLoading(false);
                      }
                    }}
                  />
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                  )}
                </>
              ) : (
                <div className="w-full h-[480px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                  <div className="text-center">
                    <Tag size={48} className="mx-auto mb-2" />
                    <p>No image available</p>
                  </div>
                </div>
              )}

              {imgs.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => setImgIndex(i => (i - 1 + imgs.length) % imgs.length)}
                  >
                    <ChevronLeft size={24} className="text-gray-700" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => setImgIndex(i => (i + 1) % imgs.length)}
                  >
                    <ChevronRight size={24} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Image indicators */}
              {imgs.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {imgs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setImgIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === imgIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {imgs.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {imgs.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setImgIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      index === imgIndex 
                        ? 'border-blue-500 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      key={`thumb-${product._id}-${index}-${product.updatedAt || product.createdAt}`}
                      src={img} 
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target;
                        const src = img.src;
                        if (!src.includes('?v=') && !src.includes('&v=')) {
                          const separator = src.includes('?') ? '&' : '?';
                          img.src = `${src}${separator}v=${Date.now()}`;
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              {/* Header with actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{product.views || 0} views</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ${product.price ?? 0}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-lg text-gray-500 line-through">
                    ${product.originalPrice}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Tag className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold capitalize">{product.category || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Shield className="text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Condition</p>
                    <p className="font-semibold capitalize">{product.condition || 'Used'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="text-red-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{product.location || 'Campus'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Listed</p>
                    <p className="font-semibold">{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                    liked
                      ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={20} className={liked ? 'fill-current' : ''} />
                  {liked ? 'Liked' : 'Like'}
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  <Bookmark size={20} />
                  {saving ? 'Saving...' : 'Save'}
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-yellow-50 text-yellow-700 border-2 border-yellow-200 rounded-xl font-semibold hover:bg-yellow-100 transition-all"
                    >
                      <Edit size={20} />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={20} />
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Contact Seller Button */}
              {!isOwner && (
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <MessageCircle size={20} />
                  Message Seller
                </button>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {product.sellerUsername?.charAt(0)?.toUpperCase() || (product.seller?.username?.charAt(0) || 'S')}
                  </div>
                  {product.seller?.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">
                      {product.sellerUsername || product.seller?.username || 'Seller'}
                    </span>
                    <Badge badge={product.seller?.badge} size="sm" />
                    {product.seller?.verified && (
                      <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <Shield size={14} />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">{product.seller?.school || product.sellerSchool || 'CUNY'}</p>
                  <p className="text-sm text-gray-500">{product.sellerEmail || product.seller?.email || ''}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>⭐ 4.8</span>
                    <span>•</span>
                    <span>98% positive</span>
                  </div>
                </div>
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