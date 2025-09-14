import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../src/api/axios'; // your custom axios instance or just 'axios'
import { useAuth } from '../context/AuthContext';

const UploadNote = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    professor: '',
    level: '',
    description: '',
    isAlumni: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return toast.error('Please select a file');

    const data = new FormData();
    data.append('file', file);
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    try {
      await axios.post('/api/notes/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Note uploaded successfully!');
      console.log('Note uploaded successfully');
      navigate('/notes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-700">Upload a Note</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="block w-full text-sm border border-gray-300 p-2 rounded"
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 rounded"
        />

        <input
          type="text"
          name="professor"
          placeholder="Professor"
          value={formData.professor}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />

        <input
          type="text"
          name="level"
          placeholder="Course Level"
          value={formData.level}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />
        <input
          type="text"
          name="course number"
          placeholder="Please enter course name and number i.e. CSCI 1234"
          value={formData.courseNumber}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />

        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="isAlumni"
            checked={formData.isAlumni}
            onChange={handleChange}
            className="mr-2"
          />
          This is an alumni note
        </label>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Upload Note
        </button>
      </form>
    </div>
  );
};

export default UploadNote;
