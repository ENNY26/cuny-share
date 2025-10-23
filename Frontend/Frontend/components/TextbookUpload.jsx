import React, { useState } from 'react';
import axios from '../src/api/axios';
import { toast } from 'react-toastify';

const TextbookUpload = () => {
  const [formData, setFormData] = useState({
    files: [],
    title: '',
    author: '',
    edition: '',
    condition: '',
    price: '',
    isFlexible: false,
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'files') {
      setFormData(prev => ({ ...prev, files: Array.from(files) }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    try {
      setIsUploading(true);
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('author', formData.author);
      payload.append('edition', formData.edition);
      payload.append('condition', formData.condition);
      payload.append('price', formData.price);
      payload.append('isFlexible', formData.isFlexible ? 'true' : 'false');
      payload.append('description', formData.description);

      // append multiple files with the field name 'files'
      formData.files.forEach(file => {
        payload.append('files', file);
      });

      const res = await axios.post('/api/textbook', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Textbook uploaded');
      // reset form
      setFormData({
        files: [],
        title: '',
        author: '',
        edition: '',
        condition: '',
        price: '',
        isFlexible: false,
        description: ''
      });
    } catch (err) {
      console.error('upload error', err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="file"
        name="files"
        multiple
        accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
      />

      <input
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Title"
        className="border px-3 py-2 rounded w-full"
      />

      <input
        name="author"
        value={formData.author}
        onChange={handleInputChange}
        placeholder="Author"
        className="border px-3 py-2 rounded w-full"
      />

      <input
        name="price"
        value={formData.price}
        onChange={handleInputChange}
        placeholder="Price"
        className="border px-3 py-2 rounded w-full"
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="Description"
        className="border px-3 py-2 rounded w-full"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isFlexible"
          checked={formData.isFlexible}
          onChange={handleInputChange}
        />
        <label>Flexible exchange</label>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
};

export default TextbookUpload;