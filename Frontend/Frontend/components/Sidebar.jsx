import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Sidebar = ({ selected, setSelected }) => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'All Notes', key: 'all' },
    { name: 'Saved Notes', key: 'saved' },
    { name: 'My Uploads', key: 'uploads' },
    { name: 'Upload Note', key: 'upload' },
    { name: 'Logout', key: 'logout' },
  ];

  return (
    <div className="fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg w-64 p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6">👤 {user?.username}</h2>
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setSelected(item.key)}
            className={`px-4 py-2 text-left rounded ${
              selected === item.key ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
