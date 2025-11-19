import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, DoorOpen, Hash, Info, Plus, Loader2, AlertCircle } from 'lucide-react';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, api } = useAuth();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setJoining(true);

    try {
      console.log('🚪 Joining room with code:', code);
      
      const response = await api.post('/rooms/join', {
        code: code.toUpperCase()
      });

      if (response.data.success) {
        const room = response.data.data;
        console.log('✅ Successfully joined room:', room);
        navigate(`/room/${room.code}`);
      } else {
        setError(response.data.message || 'Failed to join room');
      }
    } catch (error) {
      console.error('❌ Error joining room:', error);
      setError(error.response?.data?.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-purple-100 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl animate-[slideUp_0.6s_ease-out]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Room</h1>
            <p className="text-purple-100">Enter the room code to join the game</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Room Code
              </label>
              <input
                type="text"
                className="w-full px-6 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-center text-2xl font-bold tracking-widest placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength="6"
                required
                autoFocus
              />
              <p className="text-purple-100 text-sm mt-2 text-center">
                Ask the host for the room code
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 disabled:bg-white/50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              disabled={joining || code.length !== 6}
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </span>
              ) : (
                'Join Room'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-[slideUp_0.8s_ease-out]">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-purple-200 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-bold mb-2">How to join</h4>
              <ul className="text-purple-100 space-y-1 text-sm">
                <li>• Get the 6-digit room code from your host</li>
                <li>• Enter the code above</li>
                <li>• Click "Join Room"</li>
                <li>• Wait for the host to start the game</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-white font-semibold">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Create Room Button */}
        <button
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2 animate-[slideUp_1s_ease-out]"
          onClick={() => navigate('/create-room')}
        >
          <Plus className="w-5 h-5" />
          Create Your Own Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
