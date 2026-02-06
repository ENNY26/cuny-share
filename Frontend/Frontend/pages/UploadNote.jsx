import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../src/api/axios';
import { toast } from 'react-toastify';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  MapPin,
  FileText,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const UploadNote = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'general',
    condition: 'used',
    location: '',
    files: []
  });

  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { value: 'general', label: 'General', icon: '📦' },
    { value: 'books', label: 'Books', icon: '📚' },
    { value: 'furniture', label: 'Furniture', icon: '🛋️' },
    { value: 'electronics', label: 'Electronics', icon: '💻' },
    { value: 'bikes', label: 'Bikes', icon: '🚲' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'services', label: 'Services', icon: '🔧' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'used', label: 'Used' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setFormData(prev => ({ ...prev, files: [...prev.files, ...validFiles].slice(0, 6) }));

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result].slice(0, 6));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (formData.files.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsUploading(true);

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description || '');
      payload.append('price', formData.price);
      payload.append('category', formData.category);
      payload.append('condition', formData.condition);
      if (formData.location) {
        payload.append('location', formData.location);
      }

      // Append all files with the field name 'files'
      formData.files.forEach(file => {
        payload.append('files', file);
      });

      await axios.post('/api/products', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Product listed successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'general',
        condition: 'used',
        location: '',
        files: []
      });
      setPreviews([]);
      
      // Navigate to product list after a short delay
      setTimeout(() => {
        navigate('/notes');
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to list product. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/10">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">List Your Item</h1>
              <p className="text-sm text-gray-600">Share your items with the campus community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="text-blue-600" size={20} />
              Photos <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-4">Upload up to 6 images. First image will be the cover photo.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 sm:h-40 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              {previews.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <Upload className="text-gray-400 group-hover:text-blue-500" size={24} />
                  <span className="text-sm text-gray-600 group-hover:text-blue-600">Add Photo</span>
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="block text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., MacBook Pro 13-inch, Calculus Textbook, Office Chair"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="block text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your item in detail..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <label className="block text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="text-blue-600" size={20} />
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <label className="block text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="text-blue-600" size={20} />
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Condition */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <label className="block text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="text-blue-600" size={20} />
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <label className="block text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} />
                Location (Optional)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., City College, Brooklyn"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Listing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  List Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadNote;
