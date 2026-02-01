import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Trophy, Medal, Crown, Home, Award, Target, Loader2 } from 'lucide-react';

const Results = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { playVictoryMusic, stopAllMusic } = useAudio();
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [musicPlayed, setMusicPlayed] = useState(false);

  // Fetch results and play music
  useEffect(() => {
    fetchResults();
  }, [code]);

  // Play music when results are loaded
  useEffect(() => {
    if (results && !musicPlayed) {
      console.log('🎊 Results ready, playing victory music...');
      // Delay to ensure user interaction context
      const timer = setTimeout(() => {
        playVictoryMusic();
        setMusicPlayed(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [results, musicPlayed]);

  // Cleanup: stop music when ACTUALLY leaving Results page (component unmount)
  useEffect(() => {
    return () => {
      console.log('🏁 Component unmounting, stopping music...');
      stopAllMusic();
    };
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Get room data with players
      const roomResponse = await api.get(`/rooms?code=${code}`);
      const room = roomResponse.data.data[0];
      
      if (!room) {
        throw new Error('Room not found');
      }

      // Get leaderboard with full player details
      const leaderboardResponse = await api.get(`/rooms/${room.id}/leaderboard`);
      const leaderboard = leaderboardResponse.data.data || [];
      
      // Leaderboard sudah sorted by score DESC dari backend
      const sortedPlayers = leaderboard.map(entry => ({
        id: entry.user.id,
        username: entry.user.username,
        avatar: entry.user.avatar,
        score: entry.score,
        correctAnswers: entry.correctAnswers,
        timeBonus: entry.timeBonus
      }));
      
      // Get quiz info
      let quizTitle = 'Quiz Game';
      let category = '';
      let difficulty = '';
      
      if (room.quizId) {
        const quizResponse = await api.get(`/quizzes/${room.quizId}`);
        if (quizResponse.data.data) {
          quizTitle = quizResponse.data.data.title;
          category = quizResponse.data.data.category;
          difficulty = quizResponse.data.data.difficulty;
        }
      }

      setResults({
        room,
        players: sortedPlayers,
        winner: sortedPlayers[0],
        quizTitle,
        category,
        difficulty
      });
      
    } catch (err) {
      console.error('❌ Error fetching results:', err);
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    // Stop music when going back to home
    stopAllMusic();
    navigate('/');
  };

  const getMedalIcon = (position) => {
    switch(position) {
      case 0: return <Medal className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />; // Gold
      case 1: return <Medal className="w-8 h-8 text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]" />; // Silver
      case 2: return <Medal className="w-8 h-8 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" />; // Bronze
      default: return null;
    }
  };

  const getRankStyles = (position) => {
    switch(position) {
      case 0: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]';
      case 1: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 2: return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50';
      default: return 'bg-white/5 border-white/10 hover:bg-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-neon-pink/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 text-neon-pink animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium tracking-wide">Calculating results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: "url('/lovable-uploads/grafis-bg.png')" }}></div>

        <div className="bg-surface/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 max-w-md w-full text-center relative z-10">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <Award className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-8">{error}</p>
          <button
            onClick={handleBackToHome}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-neon-pink to-pink-600 hover:shadow-[0_0_20px_rgba(255,0,153,0.5)] text-white px-6 py-3 rounded-xl font-bold tracking-wide transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const isWinner = results.winner && results.winner.id === user?.id;

  return (
  <div className="relative min-h-screen mt-5 flex items-center justify-center p-5 overflow-hidden font-sans">
    
    {/* Background Graphic */}
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-neon-pink/20 rounded-full blur-[100px]" />
    </div>

    {/* Animated Victory Icons Background */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
      <div className="absolute top-10 left-10 animate-float-slow">
        <Trophy className="w-24 h-24 text-white" />
      </div>
      <div className="absolute top-1/3 right-14 animate-float">
        <Crown className="w-20 h-20 text-white" />
      </div>
      <div className="absolute bottom-10 left-1/4 animate-float-delayed">
        <Medal className="w-28 h-28 text-white" />
      </div>
      <div className="absolute bottom-20 right-20 animate-float-fast">
        <Award className="w-20 h-20 text-white" />
      </div>
    </div>

    {/* Main Card */}
    <div className="relative bg-surface/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl mt-10 max-w-2xl w-full overflow-hidden animate-[slideUp_0.5s_ease-out] z-10">
      
      {/* Header */}
      <div className="relative bg-black/20 text-white p-8 text-center border-b border-white/5">
        
        {/* Confetti dots */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-neon-pink rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
        
        <h1 className="text-4xl font-extrabold mb-3 relative z-10 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-800 via-yellow-100 to-yellow-600 animate-pulse">
            🎉 Game Finished! 🎊
        </h1>
        <h2 className="text-2xl font-bold mb-1 relative z-10 text-neon-pink">{results.quizTitle}</h2>
        {results.category && (
          <p className="text-gray-400 text-lg relative z-10">
            {results.category} • {results.difficulty}
          </p>
        )}
      </div>

      {/* Winner Spotlight */}
      {results.winner && (
        <div className="bg-gradient-to-b from-black/20 to-transparent p-8 text-center relative overflow-hidden">
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Glow effect behind trophy */}
                <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-6 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-bounce">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-3 text-yellow-400">
              <Crown className="w-5 h-5" />
              Winner
              <Crown className="w-5 h-5" />
            </h2>
            <h3 className="text-4xl font-bold mb-2 text-white">{results.winner.username}</h3>
            <p className="text-2xl font-semibold text-neon-pink">{results.winner.score} points</p>

            {isWinner && (
              <div className="mt-6 inline-block bg-neon-pink/20 backdrop-blur-sm rounded-xl px-8 py-3 border border-neon-pink/50 shadow-[0_0_20px_rgba(255,0,153,0.3)]">
                <p className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Congratulations! You won!
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Trophy className="w-6 h-6 text-neon-pink" />
          <h3 className="text-2xl font-bold text-white">Final Leaderboard</h3>
          <Trophy className="w-6 h-6 text-neon-pink" />
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {results.players.map((player, index) => (
            <div
              key={player.id}
              className={`
                flex items-center p-4 rounded-xl border transition-all duration-300
                ${getRankStyles(index)}
                ${player.id === user?.id ? 'ring-2 ring-neon-pink shadow-[0_0_15px_rgba(255,0,153,0.3)]' : ''}
              `}
            >
              {/* Rank */}
              <div className="flex items-center gap-4 min-w-[60px]">
                <span className={`text-xl font-bold ${index < 3 ? 'text-white' : 'text-gray-400'}`}>#{index + 1}</span>
                {getMedalIcon(index)}
              </div>

              {/* Player & Host */}
              <div className="flex-1 mx-4">
                <span className="text-lg font-semibold text-white flex items-center gap-2">
                  {player.username}
                  {player.id === user?.id && (
                    <span className="text-sm text-neon-pink font-bold tracking-wide uppercase bg-neon-pink/10 px-2 py-0.5 rounded border border-neon-pink/30">You</span>
                  )}
                  {player.id === results.room.hostId && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-pink" />
                <span className="text-xl font-bold text-white">{player.score}</span>
                <span className="text-sm text-gray-400">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="p-8 pt-0">
        <button
          onClick={handleBackToHome}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-lime-600 to-lime-600 text-white px-6 py-4 rounded-xl font-bold tracking-wide transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,0,153,0.6)] transform hover:scale-[1.02]"
        >
            <Home className="w-5 h-5" />
            Back to Home
        </button>
      </div>
    </div>
  </div>
);

};

export default Results;
