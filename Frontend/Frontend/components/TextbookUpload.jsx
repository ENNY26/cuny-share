import React, { useState } from "react";
import axios from "../src/api/axios";
import { toast } from 'react-toastify';

const TextbookUpload = () => {
  const [formData, setFormData] = useState({
    file: null,
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
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.file || !formData.title || !formData.author || 
        !formData.edition || !formData.condition || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      toast.error('Price must be a valid positive number');
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    setIsUploading(true);

    try {
      await axios.post('/api/textbook/upload', formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token if needed
        }
      });

      toast.success("Textbook uploaded successfully!");
      
      // Reset form
      setFormData({
        file: null,
        title: '',
        author: '',
        edition: '',
        condition: '',
        price: '',
        isFlexible: false,
        description: ''
      });
      
      // Reset file input
      document.getElementById('file-input').value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Textbook File *
        </label>
        <input 
          id="file-input"
          name="file"
          type="file" 
          onChange={handleInputChange} 
          required 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">PDF, DOC, Images accepted</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input 
          name="title"
          type="text" 
          placeholder="Book Title" 
          value={formData.title} 
          onChange={handleInputChange} 
          required 
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Author *
        </label>
        <input 
          name="author"
          type="text" 
          placeholder="Author" 
          value={formData.author} 
          onChange={handleInputChange} 
          required 
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edition *
          </label>
          <input 
            name="edition"
            type="text" 
            placeholder="Edition" 
            value={formData.edition} 
            onChange={handleInputChange} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition *
          </label>
          <select 
            name="condition"
            value={formData.condition} 
            onChange={handleInputChange} 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price ($) *
        </label>
        <input 
          name="price"
          type="number" 
          step="0.01"
          min="0"
          placeholder="Price" 
          value={formData.price} 
          onChange={handleInputChange} 
          required 
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea 
          name="description"
          placeholder="Description (optional)" 
          value={formData.description} 
          onChange={handleInputChange} 
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex items-center">
        <input 
          name="isFlexible"
          id="isFlexible"
          type="checkbox" 
          checked={formData.isFlexible} 
          onChange={handleInputChange} 
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isFlexible" className="ml-2 block text-sm text-gray-900">
          Open to flexible exchange
        </label>
      </div>
      
      <button 
        type="submit" 
        disabled={isUploading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Upload Textbook'}
      </button>
    </form>
  );
};

export default TextbookUpload;