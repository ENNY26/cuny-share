import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SavedListings = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await axios.get(`/api/users/${user._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setSaved(res.data.saved || []);
      } catch (err) {
        console.error('Failed to load saved listings', err);
        toast.error('Failed to load saved listings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, token]);

  if (!user) return <div className="p-6">Please log in to view saved listings.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Saved listings</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : saved.length === 0 ? (
        <div className="text-gray-600">You have no saved listings yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {saved.map(item => (
            <div
              key={item._id}
              onClick={() => navigate(`/product/${item._id}`)}
              className="bg-white border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition"
            >
              {item.images && item.images[0] ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">No image</div>
              )}
              <div className="p-3">
                <h4 className="font-semibold truncate">{item.title}</h4>
                <p className="text-green-700 font-bold">${item.price || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Seller: {item.seller?.username || 'Unknown'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedListings;
