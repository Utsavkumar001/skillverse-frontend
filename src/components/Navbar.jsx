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
    <nav className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-semibold text-gray-900 tracking-tight">
        SkillVerse
      </Link>

      <div className="flex items-center gap-5 text-sm text-gray-600">
        <Link to="/marketplace" className="hover:text-gray-900 transition-colors">
          Marketplace
        </Link>

        {user ? (
          <>
            <Link to="/my-library" className="hover:text-gray-900 transition-colors">
              My Library
            </Link>
            <Link to="/creator/dashboard" className="hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/creator/build" className="hover:text-gray-900 transition-colors">
              + Create
            </Link>
            {/* Profile dropdown */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 hover:border-gray-400 transition-colors cursor-pointer" onClick={handleLogout}>
              <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-500">Logout</span>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-900 transition-colors">Login</Link>
            <Link
              to="/register"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}