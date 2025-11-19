import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Users, Copy, Crown, Play, Trash2, LogOut, GamepadIcon, CheckCircle, AlertCircle } from 'lucide-react';

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

    // Listen for player joined event
    socket.on('player-joined', async (data) => {
      console.log('👤 Player joined event:', data);
      
      // Refresh room data to get updated players list
      if (data.players) {
        const playerIds = data.players;
        const playersData = await Promise.all(
          playerIds.map(async (playerId) => {
            try {
              const userRes = await api.get(`/auth/users/${playerId}`);
              return userRes.data.data;
            } catch (err) {
              console.error('Error fetching user:', err);
              return null;
            }
          })
        );
        setPlayers(playersData.filter(p => p !== null));
      }
    });

    // Listen for player left event
    socket.on('player-left', async (data) => {
      console.log('👋 Player left event:', data);
      
      // Refresh players list
      if (data.players) {
        const playerIds = data.players;
        const playersData = await Promise.all(
          playerIds.map(async (playerId) => {
            try {
              const userRes = await api.get(`/auth/users/${playerId}`);
              return userRes.data.data;
            } catch (err) {
              console.error('Error fetching user:', err);
              return null;
            }
          })
        );
        setPlayers(playersData.filter(p => p !== null));
      }
    });

    // Listen for game start event
    socket.on('game-started', (data) => {
      console.log('🎮 Game started:', data);
      navigate(`/game/${code}`);
    });

    // Listen for room deleted event
    socket.on('room-deleted', () => {
      alert('Room has been deleted by the host');
      navigate('/');
    });

    // Listen for errors
    socket.on('join-room-error', (data) => {
      console.error('Join room error:', data);
      setError(data.message);
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
      socket.off('room-deleted');
      socket.off('join-room-error');
    };
  }, [socket, code, navigate, api]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      
      console.log('📡 Fetching room data for code:', code);
      
      // Get room by code
      const response = await api.get(`/rooms?code=${code}`);
      
      if (response.data.success && response.data.data.length > 0) {
        const roomData = response.data.data[0];
        console.log('✅ Room data received:', roomData);
        setRoom(roomData);
        
        // Get players data
        const playerIds = roomData.players || [];
        console.log('👥 Player IDs:', playerIds);
        
        if (playerIds.length > 0) {
          const playersData = await Promise.all(
            playerIds.map(async (playerId) => {
              try {
                const userRes = await api.get(`/auth/users/${playerId}`);
                return userRes.data.data;
              } catch (err) {
                console.error('Error fetching user:', err);
                return null;
              }
            })
          );
          setPlayers(playersData.filter(p => p !== null));
        }

        // Join room via socket
        if (socket && user) {
          console.log('🔌 Emitting join-room event:', { roomCode: code, userId: user.id });
          socket.emit('join-room', { roomCode: code, userId: user.id });
        }
      } else {
        setError('Room not found');
      }
    } catch (error) {
      console.error('❌ Error fetching room:', error);
      setError(error.response?.data?.message || 'Failed to load room');
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
      alert('Cannot start game without a quiz. Please select a quiz first.');
      return;
    }

    if (socket) {
      socket.emit('start-game', { roomCode: code });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      console.log('👋 Leaving room:', { roomId: room.id, code });
      
      await api.delete(`/rooms/${room.id}/leave`);
      
      if (socket) {
        console.log('🔌 Emitting leave-room event');
        socket.emit('leave-room', { roomCode: code, userId: user.id });
      }
      
      navigate('/');
    } catch (error) {
      console.error('❌ Error leaving room:', error);
      alert('Failed to leave room: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await api.delete(`/rooms/${room.id}`);
      
      if (socket) {
        socket.emit('delete-room', { roomCode: code });
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  if (loading) {
    return (
      <div className="room-lobby-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-lobby-container">
        <div className="error-box">
          <h2>❌ {error}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isHost = room && user && room.hostId === user.id;
  const canStart = isHost && room.quizId && players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-550 to-purple-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <GamepadIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Room Lobby</h1>
                <p className="text-purple-200">Waiting for players...</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 px-6 py-4 flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-purple-200 mb-1">Room Code</div>
                <div className="text-3xl font-bold text-white tracking-wider">{code}</div>
              </div>
              <button 
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border border-white/30 hover:scale-105"
                onClick={handleCopyCode}
                title="Copy room code"
              >
                {copied ? (
                  <><CheckCircle className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Room Info */}
        {room && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div className="text-sm text-purple-200">Host</div>
              </div>
              <div className="text-xl font-bold text-white">{room.host?.username || 'Unknown'}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <GamepadIcon className="w-5 h-5 text-blue-400" />
                <div className="text-sm text-purple-200">Quiz</div>
              </div>
              <div className="text-lg font-bold text-white">
                {room.quiz ? (
                  <>
                    {room.quiz.title}
                    <div className="text-xs text-purple-300 mt-1">
                      {room.quiz.category} • {room.quiz.difficulty}
                    </div>
                  </>
                ) : (
                  <span className="text-orange-300">No quiz selected</span>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <div className="text-sm text-purple-200">Players</div>
              </div>
              <div className="text-xl font-bold text-white">
                {players.length} / {room.maxPlayers}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <div className="text-sm text-purple-200">Status</div>
              </div>
              <div className={`text-xl font-bold capitalize ${
                room.status === 'waiting' ? 'text-yellow-300' : 
                room.status === 'playing' ? 'text-green-300' : 'text-gray-300'
              }`}>
                {room.status}
              </div>
            </div>
          </div>
        )}

        {/* Players List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-white" />
            <h3 className="text-2xl font-bold text-white">Players in Room</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`relative bg-white/10 rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                  player.id === room?.hostId ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/20'
                }`}
              >
                {player.id === room?.hostId && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 rounded-full p-1.5 shadow-lg">
                    <Crown className="w-4 h-4" />
                  </div>
                )}
                <img 
                  src={player.avatar || `https://ui-avatars.com/api/?name=${player.username}&background=random`} 
                  alt={player.username}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white/30 shadow-lg"
                />
                <div className="text-center">
                  <div className="text-white font-semibold truncate">{player.username}</div>
                  {player.id === room?.hostId && (
                    <span className="text-xs text-yellow-300 font-medium">Host</span>
                  )}
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: room.maxPlayers - players.length }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center opacity-50">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Users className="w-8 h-8 text-white/50" />
                </div>
                <div className="text-white/50 text-sm">Waiting...</div>
              </div>
            ))}
          </div>
        </div>

        {players.length < 2 && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-blue-300 flex-shrink-0" />
            <div className="text-blue-100">
              Waiting for more players to join... (Minimum 2 players required)
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {isHost ? (
            <>
              <button
                className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                onClick={handleStartGame}
                disabled={!canStart}
                title={!canStart ? 'Need at least 2 players and a quiz to start' : 'Start the game'}
              >
                <Play className="w-6 h-6" />
                Start Game
              </button>
              <button
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                onClick={handleDeleteRoom}
              >
                <Trash2 className="w-6 h-6" />
                Delete Room
              </button>
            </>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              onClick={handleLeaveRoom}
            >
              <LogOut className="w-6 h-6" />
              Leave Room
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <GamepadIcon className="w-5 h-5" />
            Instructions
          </h4>
          <ul className="space-y-2 text-purple-100">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Share the room code with your friends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Wait for players to join (minimum 2 players)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Host can start the game when ready</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Have fun and good luck! 🎉</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;
