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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 mb-6 hover:scale-105"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-8 text-center">
            <div className="inline-block p-1 bg-white/20 rounded-full mb-4">
              <img 
                src={user?.avatar} 
                alt={user?.username}
                className="w-32 h-32 rounded-full border-4 border-white/50 shadow-xl"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{user?.username}</h2>
            <p className="text-purple-200 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                <div className="text-red-100">{error}</div>
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                <div className="text-green-100">{success}</div>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
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
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                  <button
                    type="button"
                    className="mt-3 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                    onClick={generateAvatar}
                  >
                    <Shuffle className="w-4 h-4" />
                    Generate Random Avatar
                  </button>
                </div>

                {formData.avatar && (
                  <div className="flex justify-center">
                    <img 
                      src={formData.avatar} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full border-2 border-white/30 shadow-lg"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
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
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={loading}
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-purple-200 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username:
                      </span>
                      <span className="text-white font-semibold">{user?.username}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-purple-200 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email:
                      </span>
                      <span className="text-white font-semibold">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-purple-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Member since:
                      </span>
                      <span className="text-white font-semibold">
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:scale-105"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:scale-105"
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
