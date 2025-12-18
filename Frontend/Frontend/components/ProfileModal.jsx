import React, { useState } from 'react';
import { X, Edit, LogOut, Mail, BookOpen, Award, Coins, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ user, onClose, onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    school: user?.school || '',
    major: user?.major || '',
    bio: user?.bio || ''
  });

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const getBadgeColor = (badge) => {
    const colors = {
      bronze: 'from-amber-700 to-amber-600',
      silver: 'from-slate-400 to-slate-500',
      gold: 'from-yellow-500 to-yellow-600',
      platinum: 'from-purple-500 to-purple-600',
      none: 'from-gray-400 to-gray-500'
    };
    return colors[badge] || 'from-gray-400 to-gray-500';
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar & Name */}
          <div className="text-center mb-6">
            <div
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getBadgeColor(
                user?.badge
              )} flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg`}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{user?.username}</h3>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Coins className="mx-auto text-yellow-500 mb-2" size={20} />
              <div className="text-2xl font-bold text-gray-800">{user?.points || 0}</div>
              <div className="text-xs text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <Award
                className={`mx-auto mb-2 ${
                  user?.badge === 'none' ? 'text-gray-400' : 'text-amber-500'
                }`}
                size={20}
              />
              <div className="text-2xl font-bold text-gray-800">{user?.badge?.toUpperCase() || 'NONE'}</div>
              <div className="text-xs text-gray-600">Badge</div>
            </div>
            <div className="text-center">
              <BookOpen className="mx-auto text-blue-500 mb-2" size={20} />
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-xs text-gray-600">Listings</div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Mail size={18} className="text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-800">{user?.email}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">School</p>
              <p className="text-sm font-medium text-gray-800">{user?.school || 'Not set'}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Major</p>
              <p className="text-sm font-medium text-gray-800">{user?.major || 'Not set'}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Bio</p>
              <p className="text-sm font-medium text-gray-800">{user?.bio || 'No bio yet'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleNavigate(`/profile/${user?._id}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Edit size={18} /> View Full Profile
            </button>

            <button
              onClick={() => handleNavigate('/my-listings')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <BookOpen size={18} /> My Listings
            </button>

            <button
              onClick={() => handleNavigate('/saved')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              ♡ Saved Listings
            </button>

            <button
              onClick={() => handleNavigate('/messages')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <MessageSquare size={18} /> Messages
            </button>

            <div className="border-t pt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;