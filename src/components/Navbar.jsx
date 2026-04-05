import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    setShowConfirm(false);
    navigate('/');
  };

  return (
    <>
      <nav className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="text-lg font-semibold text-gray-900 tracking-tight shrink-0">
          SkillVerse
        </Link>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Link to="/marketplace" className="hover:text-gray-900 transition-colors whitespace-nowrap">
            Marketplace
          </Link>

          {user ? (
            <>
              <Link to="/my-library" className="hover:text-gray-900 transition-colors whitespace-nowrap hidden sm:block">
                My Library
              </Link>
              <Link to="/creator/dashboard" className="hover:text-gray-900 transition-colors whitespace-nowrap hidden sm:block">
                Dashboard
              </Link>

              {/* Avatar */}
              <div
                className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-gray-700 transition-colors shrink-0"
                onClick={() => setShowProfile(!showProfile)}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-900 transition-colors whitespace-nowrap">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors whitespace-nowrap shrink-0"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Profile Dropdown */}
      {showProfile && user && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfile(false)}
          />

          {/* Dropdown */}
          <div className="fixed top-14 right-4 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg w-64 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <Link
                to="/my-library"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                📚 My Library
              </Link>
              <Link
                to="/creator/dashboard"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link
                to="/creator/build"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ➕ Create Agent
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 py-2">
              <button
                onClick={() => {
                  setShowProfile(false);
                  setShowConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Log out?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of SkillVerse?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}