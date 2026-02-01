import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Users, Copy, Crown, Trash2, LogOut, GamepadIcon, CheckCircle, AlertCircle, Play, Loader2 } from 'lucide-react';

const RoomLobby = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, api } = useAuth();
  const { socket } = useSocket();
  
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchRoomData();
  }, [isAuthenticated, code]);

  useEffect(() => {
    if (!socket) return;

    console.log('Setting up socket listeners for room:', code);

    const handlePlayerJoined = async (data) => {
      console.log('👤 Player joined event:', data);
      if (data.players) {
        await refreshPlayers(data.players);
      }
    };

    const handlePlayerLeft = async (data) => {
      console.log('👋 Player left event:', data);
      if (data.players) {
        await refreshPlayers(data.players);
      }
    };

    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);

    socket.on('game-started', (data) => {
      console.log('🎮 Game started:', data);
      navigate(`/game/${code}`);
    });

    socket.on('room-deleted', () => {
      alert('Room has been deleted by the host');
      navigate('/');
    });

    socket.on('join-room-error', (data) => {
      console.error('Join room error:', data);
      setError(data.message);
    });

    return () => {
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('game-started');
      socket.off('room-deleted');
      socket.off('join-room-error');
    };
  }, [socket, code, navigate, api]);

  const refreshPlayers = async (playerIds) => {
    if (!playerIds || playerIds.length === 0) return;
    
    try {
      // Use Promise.allSettled to avoid failing completely if one user fails
      const results = await Promise.allSettled(
        playerIds.map(id => api.get(`/auth/users/${id}`))
      );
      
      const newPlayers = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value.data.data);
        
      setPlayers(newPlayers);
    } catch (err) {
      console.error('Error refreshing players:', err);
    }
  };

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/rooms?code=${code}`);
      
      if (response.data.success && response.data.data.length > 0) {
        const roomData = response.data.data[0];
        setRoom(roomData);
        
        // Initial player fetch
        if (roomData.players && roomData.players.length > 0) {
          await refreshPlayers(roomData.players);
        }

        // Join room socket
        if (socket && user) {
          socket.emit('join-room', { roomCode: code, userId: user.id });
        }
      } else {
        setError('Room not found');
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      setError('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (!room.quizId) {
      alert('Cannot start game without a quiz.');
      return;
    }
    if (socket) {
      socket.emit('start-game', { roomCode: code });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await api.delete(`/rooms/${room.id}/leave`);
      if (socket) {
        socket.emit('leave-room', { roomCode: code, userId: user.id });
      }
      navigate('/');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm('Delete this room?')) return;
    try {
      await api.delete(`/rooms/${room.id}`);
      if (socket) {
        socket.emit('delete-room', { roomCode: code });
      }
      navigate('/');
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-neon-pink animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-surface/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all w-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isHost = room && user && room.hostId === user.id;

  return (
    <div className="min-h-screen py-8 px-4 mt-12 font-sans relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full mt-50 h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-surface/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-neon-pink to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-neon-pink/20">
                <GamepadIcon className="w-10 h-10 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-1">Room Lobby</h1>
                <p className="text-gray-400 text-lg">Waiting for players...</p>
              </div>
            </div>
            
            <div className="bg-black/10 backdrop-blur-lg rounded-2xl border border-white/10 px-8 py-6 flex flex-col items-center gap-3 min-w-[240px]">
               <div className="text-sm text-gray-400 font-medium uppercase tracking-widest">Room Code</div>
               <div className="text-5xl font-mono font-bold text-lime-600 tracking-widest text-shadow-glow">{code}</div>
              <button 
                className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-neon-pink/30 group"
                onClick={handleCopyCode}
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 group-hover:text-neon-pink transition-colors" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Host Info */}
            <div className="bg-surface/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                        <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">Host</div>
                        <div className="text-xl font-bold text-white">{room?.host?.username || 'Loading...'}</div>
                    </div>
                </div>
            </div>

            {/* Quiz Info */}
            <div className="bg-bl/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl">
                        <GamepadIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-sm text-gray-400">Selected Quiz</div>
                        <div className="text-xl font-bold text-white truncate">
                            {room?.quiz ? room.quiz.title : <span className="text-gray-500 italic">No quiz selected</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Players Grid */}
        <div className="bg-surface/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Players ({players.length})</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {players.map((player) => (
                    <div key={player.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-all">
                        <div className="relative">
                            <img src={player.avatar || `https://ui-avatars.com/api/?name=${player.username}`} alt={player.username} className="w-16 h-16 rounded-full border-2 border-white/20" />
                            {room.hostId === player.id && (
                                <div className="absolute -top-2 -right-2 text-yellow-500 bg-yellow-500/20 rounded-full p-1 shadow-lg">
                                    <Crown className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <span className="text-white font-medium truncate w-full text-center">{player.username}</span>
                    </div>
                ))}
                
                {/* Empty slots placeholders */}
                {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white/5 border border-white/5 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-3 opacity-50">
                        <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white/20" />
                        </div>
                        <span className="text-white/30 text-sm">Waiting...</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
            {isHost ? (
                <>
                    <button 
                        onClick={handleDeleteRoom}
                        className="px-8 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete Room
                    </button>
                    <button 
                        onClick={handleStartGame}
                        className="px-8 py-4 bg-gradient-to-r from-lime-600 to-lime-600 hover:shadow-[0_0_20px_rgba(255,0,153,0.5)] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 hover:bg-lime-900 flex-1 md:max-w-md shadow-xl"
                    >
                        <Play className="w-6 h-6 fill-current" />
                        Start Game
                    </button>
                </>
            ) : (
                <div className="w-full text-center">
                    <p className="text-gray-400 mb-4 animate-pulse">Waiting for host to start the game...</p>
                    <button 
                        onClick={handleLeaveRoom}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mx-auto"
                    >
                        <LogOut className="w-5 h-5" />
                        Leave Room
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;
