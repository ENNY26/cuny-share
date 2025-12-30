import { useState } from 'react';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Image as ImageIcon, DollarSign, Sparkles, X, Check } from 'lucide-react';

const UploadNote = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('general');
  const [condition, setCondition] = useState('used');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState('product');

  const categories = [
    { value: 'books', label: 'Books', icon: '📚', color: 'from-amber-500 to-orange-500' },
    { value: 'furniture', label: 'Furniture', icon: '🪑', color: 'from-rose-500 to-pink-500' },
    { value: 'electronics', label: 'Electronics', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { value: 'clothing', label: 'Clothing', icon: '👕', color: 'from-purple-500 to-indigo-500' },
    { value: 'bikes', label: 'Bikes', icon: '🚲', color: 'from-green-500 to-emerald-500' },
    { value: 'general', label: 'General', icon: '📦', color: 'from-gray-500 to-slate-500' }
  ];

  const conditions = [
    { value: 'new', label: 'New', desc: 'Brand new, never used' },
    { value: 'like-new', label: 'Like New', desc: 'Used once or twice' },
    { value: 'used', label: 'Used', desc: 'Good condition' },
    { value: 'poor', label: 'Fair', desc: 'Some wear and tear' }
  ];

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (postType === 'product') {
      if (!title.trim()) return toast.error('Title is required');
      if (!price || price < 0) return toast.error('Please enter a valid price');
      if (files.length === 0) return toast.error('Please add at least one photo');

      setLoading(true);
      try {
        const fd = new FormData();
        fd.append('title', title.trim());
        fd.append('description', description.trim());
        fd.append('price', price);
        fd.append('category', category);
        fd.append('condition', condition);
        if (location) fd.append('location', location);
        files.forEach((f) => fd.append('files', f));
        
        const res = await axios.post('/api/products', fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        toast.success('Listing created successfully!');
        navigate('/notes'); // Go to listings page instead of home
      } catch (err) {
        console.error('Upload error', err);
        toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!title.trim()) return toast.error('Title is required');
      if (files.length === 0) return toast.error('Please add at least one image');

      setLoading(true);
      try {
        const fd = new FormData();
        fd.append('title', title.trim());
        fd.append('description', description.trim());
        fd.append('postType', 'forum');
        files.forEach((f) => fd.append('files', f));
        
        const res = await axios.post('/api/notes/upload', fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        toast.success('Forum post created successfully!');
        navigate('/notes'); // Go to listings page instead of home
      } catch (err) {
        console.error('Upload error', err);
        toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Marketplace</span>
          </button>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {postType === 'forum' ? 'Create Forum Post' : 'List an Item'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {postType === 'forum' ? 'Share with the community' : 'Sell your items to fellow students'}
                </p>
              </div>
            </div>

            {/* Post Type Toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setPostType('product')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  postType === 'product'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Product Listing
              </button>
              <button
                onClick={() => {
                  setPostType('forum');
                  toast.info('Forum feature coming soon!', {
                    position: 'top-center',
                    autoClose: 3000,
                  });
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  postType === 'forum'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Forum Post
              </button>
            </div>
          </div>
        </div>

        {/* Modern Form or Coming Soon */}
        {postType === 'forum' ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-blue-600" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-xl text-gray-600 mb-2">
                The Forum feature is under development
              </p>
              <p className="text-gray-500">
                We're working hard to bring you an amazing community forum experience. Stay tuned!
              </p>
              <button
                onClick={() => setPostType('product')}
                className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={20} />
                Back to Product Listing
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Photos Upload - Enhanced */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-4">
                Photos
                <span className="text-gray-500 font-normal ml-2">({files.length}/5)</span>
              </label>
              
              {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 transition-all bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-white" size={28} />
                  </div>
                  <p className="text-base font-semibold text-gray-700 mb-1">
                    <span className="text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFiles}
                  className="hidden"
                />
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={postType === 'forum' ? "What's on your mind?" : "What are you selling?"}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={postType === 'forum' ? "Share your thoughts..." : "Describe your item... (condition, features, etc.)"}
                rows={5}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg bg-white/50 backdrop-blur-sm transition-all"
              />
            </div>

            {/* Product-specific fields */}
            {postType === 'product' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., City College Campus"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/50 backdrop-blur-sm"
                  />
                </div>

                {/* Category - Visual Selection */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          category === cat.value
                            ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-xs font-semibold">{cat.label}</div>
                        {category === cat.value && (
                          <Check className="absolute top-2 right-2 text-white" size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition - Visual Selection */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Condition
                  </label>
                  <div className="space-y-2">
                    {conditions.map((cond) => (
                      <button
                        key={cond.value}
                        type="button"
                        onClick={() => setCondition(cond.value)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          condition === cond.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{cond.label}</div>
                            <div className="text-sm text-gray-500">{cond.desc}</div>
                          </div>
                          {condition === cond.value && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="text-white" size={14} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={loading || !title.trim() || (postType === 'product' && (!price || files.length === 0)) || (postType === 'forum' && files.length === 0)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    {postType === 'forum' ? 'Creating Post...' : 'Creating Listing...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    {postType === 'forum' ? 'Create Post' : 'Create Listing'}
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-4">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </form>
        </div>

        {/* Tips - Only show for product listings */}
        {postType === 'product' && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              Tips for a great listing
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Use clear, well-lit photos from multiple angles</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Write a detailed description including any flaws</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Set a fair price based on condition and original value</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Be responsive to potential buyers</span>
              </li>
            </ul>
          </div>
        )}
          </div>
        )}
    </div>
  );
};

export default UploadNote;
