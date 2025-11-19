import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Trophy, Medal, Crown, Home, Award, Target } from 'lucide-react';

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
  }, [results, musicPlayed]); // Removed playVictoryMusic dari dependencies untuk avoid loop

  // Cleanup: stop music when ACTUALLY leaving Results page (component unmount)
  useEffect(() => {
    return () => {
      console.log('� Component unmounting, stopping music...');
      stopAllMusic();
    };
  }, []); // Empty dependencies = only run on mount/unmount

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

  // Manual play music button (untuk bypass browser autoplay policy)
  const handlePlayMusic = () => {
    console.log('🎵 Manual play button clicked!');
    playVictoryMusic();
  };

  const getMedalIcon = (position) => {
    switch(position) {
      case 0: return <Medal className="w-6 h-6 text-yellow-400" />; // Gold
      case 1: return <Medal className="w-6 h-6 text-gray-300" />; // Silver
      case 2: return <Medal className="w-6 h-6 text-amber-600" />; // Bronze
      default: return null;
    }
  };

  const getRankStyles = (position) => {
    switch(position) {
      case 0: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400';
      case 1: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300';
      case 2: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-600';
      default: return 'bg-white border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToHome}
            className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
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
  <div className="relative min-h-screen flex items-center justify-center p-5 overflow-hidden bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]">
    
    {/* Animated Victory Icons Background */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.12]">
      <div className="absolute top-10 left-10 animate-float-slow">
        <Trophy className="w-24 h-24 text-white/40" />
      </div>
      <div className="absolute top-1/3 right-14 animate-float">
        <Crown className="w-20 h-20 text-white/40" />
      </div>
      <div className="absolute bottom-10 left-1/4 animate-float-delayed">
        <Medal className="w-28 h-28 text-white/40" />
      </div>
      <div className="absolute bottom-20 right-20 animate-float-fast">
        <Award className="w-20 h-20 text-white/40" />
      </div>
    </div>

    {/* Main Card */}
    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.25)] max-w-2xl w-full overflow-hidden animate-[slideUp_0.5s_ease-out]">
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-10 text-center shadow-[inset_0_0_30px_rgba(255,255,255,0.15)] overflow-hidden">
        {/* Colorful Ribbon Decorations */}
        {/* Top left ribbons */}
        <div className="absolute top-2 left-4 w-16 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full rotate-45 animate-pulse" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-6 left-8 w-12 h-2 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full -rotate-45 animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-10 left-2 w-10 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full rotate-12 animate-pulse" style={{animationDelay: '0.6s'}}></div>
        
        {/* Top right ribbons */}
        <div className="absolute top-3 right-6 w-14 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full -rotate-45 animate-pulse" style={{animationDelay: '0.2s'}}></div>
        <div className="absolute top-8 right-10 w-12 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full rotate-45 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-12 right-4 w-10 h-2 bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full -rotate-12 animate-pulse" style={{animationDelay: '0.8s'}}></div>
        
        {/* Bottom left ribbons */}
        <div className="absolute bottom-4 left-6 w-14 h-2 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full -rotate-12 animate-pulse" style={{animationDelay: '0.4s'}}></div>
        <div className="absolute bottom-8 left-12 w-10 h-2 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full rotate-45 animate-pulse" style={{animationDelay: '0.7s'}}></div>
        
        {/* Bottom right ribbons */}
        <div className="absolute bottom-5 right-8 w-12 h-2 bg-gradient-to-r from-lime-400 to-green-500 rounded-full rotate-12 animate-pulse" style={{animationDelay: '0.1s'}}></div>
        <div className="absolute bottom-10 right-14 w-14 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full -rotate-45 animate-pulse" style={{animationDelay: '0.9s'}}></div>
        
        {/* Confetti dots */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
        
        <div className="flex justify-center mb-4">
        </div>
        <h1 className="text-4xl font-bold mb-3 relative z-10">🎉 Game Finished! 🎊</h1>
        <h2 className="text-2xl font-semibold mb-1 relative z-10">{results.quizTitle}</h2>
        {results.category && (
          <p className="text-purple-200 text-lg relative z-10">
            {results.category} • {results.difficulty}
          </p>
        )}
      </div>

      {/* Winner Spotlight */}
      {results.winner && (
        <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white p-10 text-center relative overflow-hidden shadow-inner">
          {/* Victory Icons Background - More decorative */}
          <div className="absolute top-3 left-4 animate-pulse opacity-40">
            <Award className="w-10 h-10" />
          </div>
          <div className="absolute top-3 right-4 animate-pulse opacity-40" style={{ animationDelay: '0.7s' }}>
            <Award className="w-10 h-10" />
          </div>
          <div className="absolute bottom-3 left-8 animate-bounce opacity-30" style={{ animationDelay: '0.3s' }}>
            <Medal className="w-12 h-12" />
          </div>
          <div className="absolute bottom-3 right-8 animate-bounce opacity-30" style={{ animationDelay: '0.5s' }}>
            <Medal className="w-12 h-12" />
          </div>
          <div className="absolute top-1/2 left-6 animate-pulse opacity-25" style={{ animationDelay: '1s' }}>
            <Crown className="w-9 h-9" />
          </div>
          <div className="absolute top-1/2 right-6 animate-pulse opacity-25" style={{ animationDelay: '0.4s' }}>
            <Crown className="w-9 h-9" />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {/* Glow effect behind trophy */}
                <div className="absolute inset-0 bg-white/40 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-white/30 p-5 rounded-full animate-bounce">
                  <Trophy className="w-16 h-16" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 animate-bounce" />
              Winner
              <Crown className="w-6 h-6 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </h2>
            <h3 className="text-3xl font-bold mb-2">{results.winner.username}</h3>
            <p className="text-2xl font-semibold">{results.winner.score} points</p>

            {isWinner && (
              <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                <p className="text-lg font-semibold animate-pulse flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Congratulations! You won!
                  <Trophy className="w-5 h-5" />
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="p-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Trophy className="w-7 h-7 text-purple-600" />
          <h3 className="text-3xl font-bold text-gray-900">Final Leaderboard</h3>
          <Trophy className="w-7 h-7 text-purple-600" />
        </div>

        <div className="space-y-4">
          {results.players.map((player, index) => (
            <div
              key={player.id}
              className={`
                flex items-center p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]
                ${getRankStyles(index)}
                ${player.id === user?.id ? 'ring-4 ring-purple-400 shadow-lg' : ''}
              `}
            >
              {/* Rank */}
              <div className="flex items-center gap-3 min-w-[80px]">
                <span className="text-xl font-bold text-gray-700">#{index + 1}</span>
                {getMedalIcon(index)}
              </div>

              {/* Player & Host */}
              <div className="flex-1 mx-4">
                <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {player.username}
                  {player.id === user?.id && (
                    <span className="text-sm text-purple-600 font-medium">(You)</span>
                  )}
                  {player.id === results.room.hostId && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-xl font-bold text-purple-700">{player.score}</span>
                <span className="text-sm text-gray-600">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="p-10 pt-0 space-y-3">
   
        <button
          onClick={handleBackToHome}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
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
