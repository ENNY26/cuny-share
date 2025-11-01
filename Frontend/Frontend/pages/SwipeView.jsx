import React, { useEffect, useState } from 'react';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import SwipeDeck from '../components/SwipeDeck';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SwipeView = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/products?page=1&limit=50', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = res.data;
        const list = Array.isArray(data.products) ? data.products : (data.products || []);
        setItems(list);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSwipeAction = async (direction, product) => {
    // right => like/save, left => dismiss
    if (direction === 'right') {
      try {
        await axios.post(`/api/products/${product._id}/like`, {}, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        toast.success('Liked');
      } catch (err) {
        console.error('Like failed', err);
        toast.error('Failed to like');
      }
    } else if (direction === 'left') {
      // optionally send backend view or ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-indigo-600">Back</button>
        <h2 className="text-lg font-semibold">Swipe Listings</h2>
        <div></div>
      </header>

      {loading ? (
        <div className="p-6 text-center">Loading...</div>
      ) : (
        <SwipeDeck items={items} onSwipeAction={handleSwipeAction} />
      )}
    </div>
  );
};

export default SwipeView;