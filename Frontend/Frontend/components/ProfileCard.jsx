import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

const ProfileCard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewProfile = () => {
    navigate(`/profile/${user._id}`);
  };

  const getBadgeColor = (badge) => {
    const colors = {
      bronze: 'bg-amber-700',
      silver: 'bg-slate-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500',
      none: 'bg-gray-300'
    };
    return colors[badge] || 'bg-gray-300';
  };

  return (
    <div className="fixed top-4 left-4 z-40 bg-white rounded-lg shadow-md border border-gray-200 p-4 w-64">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getBadgeColor(user.badge)}`}>
          {user.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate text-sm">{user.username}</div>
          <div className="text-xs text-gray-600">{user.school || 'CUNY'}</div>
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-3 space-y-1">
        <div><strong>Major:</strong> {user.major || 'Not set'}</div>
        <div><strong>Badge:</strong> {user.badge?.toUpperCase() || 'NONE'}</div>
        <div className="text-yellow-600"><strong>Points:</strong> {user.points || 0}</div>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t">
        <button
          onClick={handleViewProfile}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          <User size={14} /> View Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;