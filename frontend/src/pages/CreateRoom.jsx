import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Sparkles, BookOpen, Users, Settings, Info, Loader2, LayoutGrid, List } from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [selectionMode, setSelectionMode] = useState('dropdown'); // 'dropdown' or 'card'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchQuizzes();
    
    // Check if returning from QuizSelection with selected quiz
    if (location.state?.selectedQuizId) {
      setFormData(prev => ({
        ...prev,
        quizId: location.state.selectedQuizId
      }));
      setRoomMode('existing');
      setSelectionMode('dropdown');
    }
  }, [isAuthenticated, location.state]);

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-neon-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 relative p-4 md:p-8">

      <div className="max-w-3xl mx-auto relative z-10">
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
            <div className="w-20 h-20 bg-gradient-to-br from-neon-pink to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-neon-pink/20 rotate-3 hover:rotate-6 transition-transform">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Create Room</h1>
            <p className="text-mauve/80 text-lg">Setup your quiz game environment</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreateRoom} className="space-y-8">
            {/* Room Mode Selection */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-neon-pink rounded-full"></span> Choose Room Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRoomMode('existing')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                    roomMode === 'existing'
                      ? 'border-neon-pink bg-surface shadow-lg shadow-neon-pink/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <BookOpen className={`w-8 h-8 mb-3 transition-colors ${roomMode === 'existing' ? 'text-neon-pink' : 'text-mauve'}`} />
                  <div className="text-white font-bold text-lg mb-1">Existing Quiz</div>
                  <div className="text-mauve/70 text-sm">Select from available library</div>
                  {roomMode === 'existing' && <div className="absolute top-0 right-0 p-2 bg-neon-pink/20 rounded-bl-xl"><div className="w-2 h-2 rounded-full bg-neon-pink"></div></div>}
                </button>
                
                <button
                  type="button"
                  onClick={() => setRoomMode('ai')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                    roomMode === 'ai'
                      ? 'border-neon-pink bg-surface shadow-lg shadow-neon-pink/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Sparkles className={`w-8 h-8 mb-3 transition-colors ${roomMode === 'ai' ? 'text-neon-pink' : 'text-mauve'}`} />
                  <div className="text-white font-bold text-lg mb-1">AI Generated</div>
                  <div className="text-mauve/70 text-sm">Create fresh questions with Gemini</div>
                   {roomMode === 'ai' && <div className="absolute top-0 right-0 p-2 bg-neon-pink/20 rounded-bl-xl"><div className="w-2 h-2 rounded-full bg-neon-pink"></div></div>}
                </button>
              </div>
            </div>

            {/* AI Generation Form */}
            {roomMode === 'ai' && (
              <div className="space-y-5 animate-[slideUp_0.4s_ease-out] bg-[#16002A]/40 p-6 rounded-2xl border border-white/5">
                <div>
                  <label className="block text-white font-semibold mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 bg-[#16002A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all appearance-none cursor-pointer"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Difficulty</label>
                    <select
                      name="difficulty"
                      className="w-full px-4 py-3 bg-[#16002A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all appearance-none cursor-pointer"
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
                    <label className="block text-white font-semibold mb-2">Questions</label>
                    <input
                      type="number"
                      name="numberOfQuestions"
                      className="w-full px-4 py-3 bg-[#16002A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
                      min="3"
                      max="20"
                      value={formData.numberOfQuestions}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Select Existing Quiz */}
            {roomMode === 'existing' && (
              <div className="animate-[slideUp_0.4s_ease-out] bg-[#16002A]/40 p-6 rounded-2xl border border-white/5 space-y-4">
                {/* Selection Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-white font-semibold">Select Quiz</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectionMode('dropdown')}
                      className={`p-2 rounded-lg transition-all ${
                        selectionMode === 'dropdown'
                          ? 'bg-neon-pink text-white'
                          : 'bg-white/10 text-mauve hover:bg-white/20'
                      }`}
                      title="Dropdown selection"
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/quiz-selection', { 
                        state: { 
                          fromCreateRoom: true,
                          roomData: formData
                        }
                      })}
                      className={`p-2 rounded-lg transition-all ${
                        selectionMode === 'card'
                          ? 'bg-neon-pink text-white'
                          : 'bg-white/10 text-mauve hover:bg-white/20'
                      }`}
                      title="Card selection"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Dropdown Mode */}
                {selectionMode === 'dropdown' && (
                  <>
                    {quizzes.length > 0 ? (
                      <>
                        <select
                          name="quizId"
                          className="w-full px-4 py-3 bg-[#16002A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all appearance-none cursor-pointer"
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
                        
                        {/* Or browse cards button */}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex-1 h-px bg-white/10"></div>
                          <span className="text-mauve/50 text-sm">or</span>
                          <div className="flex-1 h-px bg-white/10"></div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => navigate('/quiz-selection', { 
                            state: { 
                              fromCreateRoom: true,
                              roomData: formData
                            }
                          })}
                          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
                        >
                          <LayoutGrid className="w-5 h-5" />
                          Browse Quiz Cards
                        </button>
                      </>
                    ) : (
                      <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                        <p className="text-yellow-200 mb-4">No quizzes available yet.</p>
                        <button
                          type="button"
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border border-white/10"
                          onClick={() => setRoomMode('ai')}
                        >
                          Generate with AI instead
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Max Players */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-pink" />
                Max Players
              </label>
              <input
                type="number"
                name="maxPlayers"
                className="w-full px-4 py-3 bg-[#16002A]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
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
              className="w-full py-5 bg-lime-600 text-white rounded-xl font-bold text-xl hover:shadow-xl hover:bg-lime-700 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={creating || (roomMode === 'existing' && !formData.quizId)}
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {roomMode === 'ai' ? 'Generating Quiz & Creating Room...' : 'Creating Room...'}
                </span>
              ) : (
                'Create Room'
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
              <h4 className="text-white font-bold mb-2 text-lg">How it works</h4>
              <ul className="text-mauve/80 space-y-2 text-sm">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div> Create a room and get a unique code</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div> Share the code with friends</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div> Wait for players to join</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neon-pink"></div> Start the game when ready!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
