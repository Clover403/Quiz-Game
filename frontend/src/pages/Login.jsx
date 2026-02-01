import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GamepadIcon, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-2 px-4 py-8 relative">
      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8 animate-[slideUp_0.6s_ease-out]">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="p-3 bg-gradient-to-br from-neon-pink to-purple-600 rounded-xl shadow-lg shadow-neon-pink/20">
              <GamepadIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Quiz<span className="text-neon-pink">Game</span></h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-mauve/80">Login to continue playing</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-[slideUp_0.8s_ease-out]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-white font-semibold mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mauve" />
                <input
                  type="email"
                  name="email"
                  className="w-full pl-11 pr-4 py-3 bg-[#16002A]/50 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mauve" />
                <input
                  type="password"
                  name="password"
                  className="w-full pl-11 pr-4 py-3 bg-[#16002A]/50 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-4 bg-lime-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:bg-lime-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3 animate-[slideUp_1s_ease-out]">
          <p className="text-white">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-lime-700 hover:text-lime-500 mb-2 transition-colors hover">
              Register here
            </Link>
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
