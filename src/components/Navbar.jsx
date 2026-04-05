import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-lg font-semibold text-gray-900 tracking-tight shrink-0">
        SkillVerse
      </Link>

      <div className="flex items-center gap-3 text-sm text-gray-600 overflow-x-auto">
        <Link to="/marketplace" className="hover:text-gray-900 transition-colors whitespace-nowrap">
          Marketplace
        </Link>

        {user ? (
          <>
            <Link to="/my-library" className="hover:text-gray-900 transition-colors whitespace-nowrap">
              My Library
            </Link>
            <Link to="/creator/dashboard" className="hover:text-gray-900 transition-colors whitespace-nowrap">
              Dashboard
            </Link>
            <div
              className="flex items-center gap-1.5 border border-gray-200 rounded-full px-2.5 py-1 hover:border-gray-400 transition-colors cursor-pointer shrink-0"
              onClick={handleLogout}
            >
              <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-500 hidden sm:block">Logout</span>
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
  );
}