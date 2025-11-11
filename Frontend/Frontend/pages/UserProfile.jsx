import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ArrowLeft, Edit } from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ school: '', major: '', bio: '' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/users/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProfile(res.data.user);
        setListings(res.data.listings || []);
        setFormData({
          school: res.data.user.school || '',
          major: res.data.user.major || '',
          bio: res.data.user.bio || ''
        });
      } catch (err) {
        console.error('Load profile error', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token]);

  const isOwnProfile = String(currentUser?._id) === String(id);

  const handleSave = async () => {
    try {
      const res = await axios.put(`/api/users/${id}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setProfile(res.data);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      console.error('Update error', err);
      toast.error('Failed to update profile');
    }
  };

  const getBadgeColor = (badge) => {
    const colors = {
      bronze: 'bg-amber-700 text-white',
      silver: 'bg-slate-400 text-white',
      gold: 'bg-yellow-500 text-white',
      platinum: 'bg-purple-500 text-white',
      none: 'bg-gray-300 text-gray-700'
    };
    return colors[badge] || 'bg-gray-300';
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <div className="p-6">Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button className="mb-4 text-sm text-gray-600 flex items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>

        {/* Profile info */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-16 mb-6">
            <div className={`w-32 h-32 rounded-full border-4 border-white flex items-center justify-center text-4xl font-bold ${getBadgeColor(profile.badge)}`}>
              {profile.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                <Edit size={16} /> {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4 mb-6">
              <input
                value={formData.school}
                onChange={(e) => setFormData(p => ({ ...p, school: e.target.value }))}
                placeholder="School"
                className="w-full border p-2 rounded"
              />
              <input
                value={formData.major}
                onChange={(e) => setFormData(p => ({ ...p, major: e.target.value }))}
                placeholder="Major"
                className="w-full border p-2 rounded"
              />
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                placeholder="Bio"
                rows="4"
                className="w-full border p-2 rounded"
              />
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
                Save Changes
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <div className="text-gray-600 mt-2 space-y-1">
                <p><strong>School:</strong> {profile.school || 'Not set'}</p>
                <p><strong>Major:</strong> {profile.major || 'Not set'}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Bio:</strong> {profile.bio || 'No bio yet'}</p>
              </div>

              <div className="flex gap-6 mt-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{listings.length}</div>
                  <div className="text-gray-600">Listings</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold px-3 py-1 rounded ${getBadgeColor(profile.badge)}`}>
                    {profile.badge?.toUpperCase() || 'NONE'}
                  </div>
                  <div className="text-gray-600">Badge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{profile.points || 0}</div>
                  <div className="text-gray-600">Points</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Listings tab */}
        <div className="border-t px-6 py-6">
          <h2 className="text-xl font-bold mb-4">Listings ({listings.length})</h2>
          {listings.length === 0 ? (
            <p className="text-gray-600">No listings yet</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings.map(item => (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;