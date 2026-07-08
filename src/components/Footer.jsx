import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const isCreator = user?.role === 'creator' || user?.role === 'admin';

  return (
    <footer className="border-t border-gray-100 mt-20 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <span>© 2026 SkillVerse</span>
        <div className="flex gap-6">
          <Link to="/marketplace" className="hover:text-gray-900 transition-colors">Marketplace</Link>
          <Link to="/api-docs" className="hover:text-gray-900 transition-colors">API Docs</Link>
          {isCreator ? (
            <Link to="/creator/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          ) : (
            <Link to="/apply-creator" className="hover:text-gray-900 transition-colors">Become a Creator</Link>
          )}
        </div>
      </div>
    </footer>
  );
}