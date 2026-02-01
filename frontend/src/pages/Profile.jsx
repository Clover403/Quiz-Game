import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Mail, Calendar, Edit, LogOut, Shuffle, AlertCircle, CheckCircle, Save, X } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const generateAvatar = () => {
    const newAvatar = `https://ui-avatars.com/api/?name=${formData.username}&background=random&size=200`;
    setFormData({ ...formData, avatar: newAvatar });
  };

  return (
    <div className="min-h-screen py-8 px-4 font-sans relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-neon-pink/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <button 
          className="flex items-center gap-2 mt-11 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 mb-6 hover:-translate-x-1"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-surface/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-b from-white/5 to-transparent p-8 text-center border-b border-white/5">
            <div className="inline-block p-1 bg-gradient-to-br from-neon-pink to-purple-600 rounded-full mb-4 shadow-[0_0_20px_rgba(255,0,153,0.4)]">
              <img 
                src={user?.avatar} 
                alt={user?.username}
                className="w-32 h-32 rounded-full border-4 border-[#16002A] bg-[#16002A]"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{user?.username}</h2>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-neon-pink" />
              {user?.email}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="text-red-200">{error}</div>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="text-green-200">{success}</div>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-neon-pink" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-pink/50 focus:border-transparent transition-all"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Avatar URL</label>
                  <input
                    type="text"
                    name="avatar"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-pink/50 focus:border-transparent transition-all"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                  <button
                    type="button"
                    className="mt-3 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all text-sm"
                    onClick={generateAvatar}
                  >
                    <Shuffle className="w-4 h-4" />
                    Generate Random Avatar
                  </button>
                </div>

                {formData.avatar && (
                  <div className="flex justify-center py-2">
                    <img 
                      src={formData.avatar} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full border-2 border-white/10 shadow-lg bg-black/20"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: user?.username || '',
                        avatar: user?.avatar || ''
                      });
                    }}
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-700 to-pink-700 hover:shadow-[0_0_20px_rgba(255,0,153,0.5)] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-black/20 rounded-2xl border border-white/5 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-neon-pink" />
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-gray-400 flex items-center gap-2">
                        Username
                      </span>
                      <span className="text-white font-semibold">{user?.username}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <span className="text-gray-400 flex items-center gap-2">
                        Email
                      </span>
                      <span className="text-white font-semibold">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-400 flex items-center gap-2">
                        Member Since
                      </span>
                      <span className="text-white font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neon-pink" />
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-700 to-pink-700 hover:shadow-[0_0_20px_rgba(255,0,153,0.5)] text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-pink-700 hover:text-red-300 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:border-red-500/30"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
