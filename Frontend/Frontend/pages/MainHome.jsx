import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.username || 'User'}</h1>
          <p className="text-gray-500 mt-2">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div 
            onClick={() => navigate('/upload-note')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-4xl mb-4">📤</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Notes</h3>
            <p className="text-gray-500">Share your study materials with classmates</p>
          </div>

          <div 
            onClick={() => navigate('/notes')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">View Notes</h3>
            <p className="text-gray-500">Access shared notes from your courses</p>
          </div>

          <div 
            onClick={() => navigate('/textbook')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Textbook Exchange</h3>
            <p className="text-gray-500">Buy, sell, or trade textbooks</p>
          </div>

          <div 
            onClick={() => navigate('/forum')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Forum</h3>
            <p className="text-gray-500">Discuss with fellow students</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-500 transition-all shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainHome;