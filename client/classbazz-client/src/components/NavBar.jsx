import React from 'react';
import { FiSun, FiLogOut } from 'react-icons/fi';

const NavBar = ({ user, onLogout, onlineCount, postCount }) => {
  return (
    <nav className="bg-[#141529] px-6 py-3 flex justify-between items-center shadow-md border-b border-purple-900/50">
      {/* Left Side: Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="bg-purple-600 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold">ClassBazz</h1>
          <p className="text-xs text-gray-400">Developer Community</p>
        </div>
      </div>

      {/* Middle: Real-time Stats */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-green-400">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white">{onlineCount} online</span>
        </div>
        <div className="bg-gray-700/50 px-3 py-1 rounded-full text-sm font-medium">
          {postCount} posts
        </div>
      </div>

      {/* Right Side: User & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-[#0D0E1A] p-1 rounded-full">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold pr-2 hidden sm:block">{user.name}</span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700/50">
          <FiSun size={20} />
        </button>
        <div className="w-px h-6 bg-gray-700"></div> {/* Separator */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <FiLogOut size={20} />
          <span className="text-sm font-medium hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;