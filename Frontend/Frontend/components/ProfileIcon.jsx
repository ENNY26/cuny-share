import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const ProfileIcon = () => {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!user) return null;

  const getBadgeColor = (badge) => {
    const colors = {
      bronze: 'bg-amber-700',
      silver: 'bg-slate-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500',
      none: 'bg-gray-400'
    };
    return colors[badge] || 'bg-gray-400';
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg hover:shadow-xl transition ${getBadgeColor(
          user.badge
        )} hover:scale-110 transition-transform`}
        title={user.username}
      >
        {user.username?.charAt(0)?.toUpperCase() || 'U'}
      </button>

      {showModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowModal(false)}
          onLogout={logout}
        />
      )}
    </>
  );
};

export default ProfileIcon;