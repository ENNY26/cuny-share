import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from '../src/api/axios';

const CommunityGuidelines = () => {
  const [guidelines, setGuidelines] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const response = await axios.get('/api/policies/guidelines');
        setGuidelines(response.data);
      } catch (error) {
        console.error('Failed to load community guidelines:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuidelines();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{guidelines?.title}</h1>
          <p className="text-gray-500 mb-8">Last Updated: {guidelines?.lastUpdated}</p>
          
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {guidelines?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;

