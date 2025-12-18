import React, { useState, useRef } from 'react';
import axios from '../src/api/axios';
import { Heart, MessageSquare, Bookmark, MoreHorizontal } from 'lucide-react';
import ChatModal from './ChatModal';

const ProductCard = ({ product, user, token, onDeleted, onEdited }) => {
  const [likesCount, setLikesCount] = useState(product.likes?.length || 0);
  const [liked, setLiked] = useState(product.likes?.some(l => String(l) === String(user?._id)));
  const [saving, setSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [animLike, setAnimLike] = useState(false);
  const lastTap = useRef(0);

  const handleLike = async () => {
    if (!token) return; // optionally redirect to login
    try {
      // optimistically update
      setLiked(prev => !prev);
      setLikesCount(prev => (liked ? prev - 1 : prev + 1));
      const res = await axios.post(`/api/products/${product._id}/like`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // keep server state if needed (res data has liked/likes)
      if (res.data?.likes !== undefined) setLikesCount(res.data.likes);
      if (res.data?.liked !== undefined) setLiked(res.data.liked);
    } catch (err) {
      console.error('Like error', err);
      // rollback on error
      setLiked(prev => !prev);
      setLikesCount(prev => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      setSaving(true);
      await axios.post(`/api/products/${product._id}/save`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.error('Save error', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // double-tap -> like
      setAnimLike(true);
      handleLike();
      setTimeout(() => setAnimLike(false), 700);
    }
    lastTap.current = now;
  };

  return (
    <>
      <article className="max-w-xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
        <header className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
            {product.sellerUsername?.charAt(0)?.toUpperCase() || (product.seller?.username?.charAt(0) || 'U')}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">{product.sellerUsername || product.seller?.username || 'Seller'}</div>
            <div className="text-xs text-gray-500">{product.location || 'CUNY campus'}</div>
          </div>
          <button className="p-1 text-gray-500 hover:text-gray-800"><MoreHorizontal size={18} /></button>
        </header>

        <div className="w-full bg-black/5" onDoubleClick={handleLike}>
          {product.images && product.images[0] ? (
            <img
              key={`${product._id}-${product.updatedAt || product.createdAt}`}
              src={product.images[0]}
              alt={product.title}
              onClick={handleImageClick}
              className="w-full h-[520px] object-cover select-none"
              onError={(e) => {
                // If image fails to load, try to refresh with cache-busting
                const img = e.target;
                const src = img.src;
                if (!src.includes('?v=') && !src.includes('&v=')) {
                  const separator = src.includes('?') ? '&' : '?';
                  img.src = `${src}${separator}v=${Date.now()}`;
                } else {
                  // If already has cache-busting and still fails, show placeholder
                  img.style.display = 'none';
                  img.parentElement.innerHTML = '<div class="w-full h-[360px] flex items-center justify-center bg-gray-100 text-gray-400">Image not available</div>';
                }
              }}
            />
          ) : (
            <div className="w-full h-[360px] flex items-center justify-center bg-gray-100 text-gray-400">
              No image
            </div>
          )}

          {/* animated heart on double-tap */}
          {animLike && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="text-white/90" size={120} style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))' }} />
            </div>
          )}
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-700'}`}>
                <Heart size={22} className={liked ? 'text-red-500' : ''} />
                <span className="text-sm font-medium">{likesCount}</span>
              </button>

              <button onClick={() => setShowChat(true)} className="flex items-center gap-2 text-gray-700">
                <MessageSquare size={20} />
                <span className="text-sm">Message</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="text-gray-700">
                <Bookmark size={18} />
              </button>
            </div>
          </div>

          <h3 className="font-semibold text-lg text-gray-800 truncate">{product.title}</h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{product.description}</p>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
            <div className="font-bold text-green-700">${product.price || '0'}</div>
            <div className="text-xs text-gray-500">{new Date(product.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </article>

      {showChat && (
        <ChatModal
          product={product}
          user={user}
          token={token}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default ProductCard;