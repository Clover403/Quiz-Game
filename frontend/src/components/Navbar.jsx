import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GamepadIcon, User, LogOut, LogIn, Plus } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 bg-transparent">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <div className="p-1.5 md:p-2 bg-lime-600 rounded-lg shadow-lg shadow-neon-pink/20 group-hover:shadow-neon-pink/40 transition-all duration-300">
              <GamepadIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-neon-pink transition-colors">
              Quiz<span className="text-neon-pink group-hover:text-white transition-colors">Game</span>
            </span>
        </Link>
        
        {/* Navigation */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {isAuthenticated ? (
            <>
              <Link to="/create-room" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-lg">
                <Plus className="w-5 h-5" />
                <span>Create Room</span>
              </Link>
              
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white group-hover:text-neon-pink transition-colors">{user?.username}</div>
                  <div className="text-xs text-gray-400">View Profile</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
                   {user?.avatar ? (
                     <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-5 h-5 text-gray-400" />
                   )}
                </div>
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              <Link 
                to="/login"
                className="text-white hover:text-neon-pink font-medium transition-colors text-sm md:text-base px-2 md:px-0"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="bg-white text-black px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <LogIn className="w-3 h-3 md:w-4 md:h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
