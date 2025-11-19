import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Sparkles, BookOpen, Users, Settings, Info, Loader2 } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, api } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    quizId: '',
    maxPlayers: 10,
    category: 'General Knowledge',
    difficulty: 'medium',
    numberOfQuestions: 5
  });

  const [roomMode, setRoomMode] = useState('ai'); // 'existing' or 'ai' only

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchQuizzes();
  }, [isAuthenticated]);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/quizzes');
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    console.log('🎯 handleCreateRoom triggered');
    console.log('Room Mode:', roomMode);
    console.log('Form Data:', formData);
    
    setError('');
    setCreating(true);

    try {
      let quizId = null;

      // Jika mode AI, buat quiz baru dulu
      if (roomMode === 'ai') {
        console.log('🤖 AI mode - generating quiz with Gemini...');
        const aiResponse = await api.post('/quizzes/ai-generate', {
          category: formData.category,
          difficulty: formData.difficulty,
          numberOfQuestions: parseInt(formData.numberOfQuestions)
        });

        if (aiResponse.data.success) {
          quizId = aiResponse.data.data.quiz.id;
          console.log('✅ Quiz generated with ID:', quizId);
        } else {
          setError('Failed to generate quiz with AI');
          setCreating(false);
          return;
        }
      } else if (roomMode === 'existing') {
        // Jika mode existing, gunakan quizId yang dipilih
        console.log('📚 Existing quiz mode - using quizId:', formData.quizId);
        quizId = formData.quizId ? parseInt(formData.quizId) : null;
        
        if (!quizId) {
          setError('Please select a quiz');
          setCreating(false);
          return;
        }
      }

      // Buat room
      const roomData = {
        maxPlayers: parseInt(formData.maxPlayers)
      };
      
      // Tambahkan quizId hanya jika ada
      if (quizId) {
        roomData.quizId = quizId;
      }

      console.log('📤 Sending room creation request:', roomData);
      const response = await api.post('/rooms', roomData);

      console.log('✅ Room created:', response.data);
      
      if (response.data.success) {
        const room = response.data.data;
        console.log('🚪 Navigating to room:', room.code);
        navigate(`/room/${room.code}`);
      } else {
        setError(response.data.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('❌ Error creating room:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to create room');
    } finally {
      console.log('🏁 Create room process finished');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]">

      <div className="max-w-3xl mx-auto">
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Room</h1>
            <p className="text-purple-100">Setup your quiz game room</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreateRoom} className="space-y-6">
            {/* Room Mode Selection */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Choose Room Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRoomMode('existing')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    roomMode === 'existing'
                      ? 'bg-white/20 border-white shadow-lg scale-105'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="w-8 h-8 text-white mx-auto mb-3" />
                  <div className="text-white font-bold mb-1">Existing Quiz</div>
                  <div className="text-purple-100 text-sm">Select from available quizzes</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRoomMode('ai')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    roomMode === 'ai'
                      ? 'bg-white/20 border-white shadow-lg scale-105'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-8 h-8 text-white mx-auto mb-3" />
                  <div className="text-white font-bold mb-1">AI Generated</div>
                  <div className="text-purple-100 text-sm">Generate quiz with Gemini AI</div>
                </button>
              </div>
            </div>

            {/* AI Generation Form */}
            {roomMode === 'ai' && (
              <div className="space-y-5 animate-[slideUp_0.4s_ease-out]">
                <div>
                  <label className="block text-white font-semibold mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Pop Culture">Pop Culture</option>
                    <option value="Sports">Sports</option>
                    <option value="Technology">Technology</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Number of Questions</label>
                  <input
                    type="number"
                    name="numberOfQuestions"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    min="3"
                    max="20"
                    value={formData.numberOfQuestions}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Select Existing Quiz */}
            {roomMode === 'existing' && (
              <div className="animate-[slideUp_0.4s_ease-out]">
                <label className="block text-white font-semibold mb-2">Select Quiz</label>
                {quizzes.length > 0 ? (
                  <select
                    name="quizId"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    value={formData.quizId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose a quiz...</option>
                    {quizzes.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.category} - {quiz.difficulty})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-center">
                    <p className="text-yellow-100 mb-3">No quizzes available yet.</p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      onClick={() => setRoomMode('ai')}
                    >
                      Generate with AI instead
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Max Players */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Max Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                min="2"
                max="50"
                value={formData.maxPlayers}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 disabled:bg-white/50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              disabled={creating || (roomMode === 'existing' && !formData.quizId)}
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {roomMode === 'ai' ? 'Generating Quiz & Creating Room...' : 'Creating Room...'}
                </span>
              ) : (
                'Create Room'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-[slideUp_0.8s_ease-out]">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-purple-200 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-bold mb-2">How it works</h4>
              <ul className="text-purple-100 space-y-1 text-sm">
                <li>• Create a room and get a unique code</li>
                <li>• Share the code with friends</li>
                <li>• Wait for players to join</li>
                <li>• Start the game when ready!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
