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
    <div className="min-h-screen mt-12 py-8 px-4 relative">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-surface/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-[slideUp_0.6s_ease-out]">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-neon-glow to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-neon-pink/20 rotate-3 hover:rotate-6 transition-transform">
              <DoorOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Join Room</h1>
            <p className="text-mauve/80 text-lg">Enter the room code to join the game</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoinRoom} className="space-y-8">
            <div>
              <label className="block text-white font-semibold mb-4 flex items-center gap-2 justify-center">
                Enter Code
              </label>
              <input
                type="text"
                className="w-full px-6 py-5 bg-[#16002A]/60 border-2 border-white/20 rounded-2xl text-white text-center text-4xl font-bold tracking-[1rem] placeholder-white/10 focus:outline-none focus:border-neon-pink focus:shadow-[0_0_20px_rgba(255,0,153,0.3)] transition-all uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="--- ---"
                maxLength="6"
                required
                autoFocus
              />
              <p className="text-mauve/60 text-sm mt-4 text-center">
                Ask the host for the 6-character room code
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-lime-600 text-white rounded-xl font-bold text-xl hover:shadow-xl hover:shadow-neon-pink/30 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              disabled={joining || code.length !== 6}
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Joining...
                </span>
              ) : (
                'Join Room'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-surface/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-[slideUp_0.8s_ease-out]">
          <div className="flex items-start gap-4">
             <div className="p-2 bg-blue-500/20 rounded-lg">
                <Info className="w-6 h-6 text-blue-300 shrink-0" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-2 text-lg">How to join</h4>
              <ul className="text-mauve/80 space-y-2 text-sm">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div> Get the 6-digit room code from your host</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div> Enter the code above and click Join</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div> Wait for the host to start the game</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8 opacity-50">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-white font-semibold">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Create Room Button */}
        <button
          className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-xl text-white font-bold text-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-3 animate-[slideUp_1s_ease-out] group"
          onClick={() => navigate('/create-room')}
        >
          <Plus className="w-5 h-5 text-neon-pink group-hover:rotate-90 transition-transform" />
          Create Your Own Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
