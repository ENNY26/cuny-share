import { useState } from 'react';
import axios from '../src/api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UploadNote = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('general');
  const [condition, setCondition] = useState('used');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error('Title required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('price', price);
      fd.append('category', category);
      fd.append('condition', condition);
      files.forEach((f) => fd.append('files', f));
      const res = await axios.post('/api/products', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      toast.success('Listing created');
      navigate('/');
    } catch (err) {
      console.error('Upload error', err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Listing</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border p-2"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (0 for free)"
          className="w-full border p-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2"
        >
          <option value="general">General</option>
          <option value="clothing">Clothing</option>
          <option value="furniture">Furniture</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
        </select>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full border p-2"
        >
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="used">Used</option>
          <option value="poor">Poor</option>
        </select>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
        />
        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {loading ? 'Listing...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadNote;
