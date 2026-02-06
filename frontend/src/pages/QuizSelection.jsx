import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Search, Filter, BookOpen, Clock, Award, Loader2 } from 'lucide-react';

// Category images mapping
const categoryImages = {
  'General Knowledge': '🌍',
  'Science': '🔬',
  'History': '📜',
  'Geography': '🗺️',
  'Sports': '⚽',
  'Entertainment': '🎬',
  'Technology': '💻',
  'Arts': '🎨',
  'Music': '🎵',
  'Literature': '📚'
};

const QuizSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, api } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [displayedQuizzes, setDisplayedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    questionRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchQuizzes();
  }, [isAuthenticated]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, displayedQuizzes]);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/quizzes');
      if (response.data.success) {
        const allQuizzes = response.data.data;
        setQuizzes(allQuizzes);
        setDisplayedQuizzes(allQuizzes.slice(0, ITEMS_PER_PAGE));
        setHasMore(allQuizzes.length > ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const filtered = getFilteredQuizzes();
    const nextPage = page + 1;
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newQuizzes = filtered.slice(startIndex, endIndex);

    setTimeout(() => {
      setDisplayedQuizzes((prev) => [...prev, ...newQuizzes]);
      setPage(nextPage);
      setHasMore(endIndex < filtered.length);
      setLoadingMore(false);
    }, 500);
  }, [page, loadingMore, hasMore, quizzes, filters, searchQuery]);

  const getFilteredQuizzes = () => {
    let filtered = [...quizzes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(quiz => 
        quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === filters.category);
    }

    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === filters.difficulty);
    }

    // Question range filter
    if (filters.questionRange !== 'all') {
      const [min, max] = filters.questionRange.split('-').map(Number);
      filtered = filtered.filter(quiz => {
        const count = quiz.totalQuestions || 0;
        if (max) {
          return count >= min && count <= max;
        } else {
          return count >= min;
        }
      });
    }

    return filtered;
  };

  const applyFilters = () => {
    const filtered = getFilteredQuizzes();
    setDisplayedQuizzes(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, quizzes]);

  const handleSelectQuiz = (quizId) => {
    // Get the state passed from CreateRoom (if any)
    const fromCreateRoom = location.state?.fromCreateRoom;
    const roomData = location.state?.roomData;

    if (fromCreateRoom && roomData) {
      // Return to CreateRoom with selected quiz
      navigate('/create-room', { 
        state: { 
          selectedQuizId: quizId,
          roomData: roomData
        }
      });
    } else {
      // Direct selection (if accessed from somewhere else)
      navigate('/create-room', { 
        state: { selectedQuizId: quizId }
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categories = ['all', ...new Set(quizzes.map(q => q.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-neon-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 relative">
      {/* Background sama seperti halaman lain */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-pink/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-lime-500/20 rounded-full blur-[120px] animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/create-room')}
            className="flex items-center gap-2 text-purple-100 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Create Room
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Choose Your Quiz
          </h1>
          <p className="text-mauve/80">
            Select from our collection of {quizzes.length} amazing quizzes
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-surface/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mauve" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#16002A]/50 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                showFilters 
                  ? 'bg-neon-pink text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
              {/* Category Filter */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#16002A]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#16002A]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Question Range Filter */}
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">Questions</label>
                <select
                  value={filters.questionRange}
                  onChange={(e) => setFilters({...filters, questionRange: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#16002A]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
                >
                  <option value="all">Any Amount</option>
                  <option value="1-5">1-5 Questions</option>
                  <option value="6-10">6-10 Questions</option>
                  <option value="11-20">11-20 Questions</option>
                  <option value="21-99999">20+ Questions</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Cards Grid */}
        {displayedQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-mauve/50 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">No quizzes found</p>
            <p className="text-mauve/60">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {displayedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-[#FFF8DC] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  {/* Card Header with Category Icon */}
                  <div className="h-32 bg-gradient-to-br from-purple-500 to-neon-pink flex items-center justify-center text-6xl">
                    {categoryImages[quiz.category] || '📚'}
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {quiz.category || 'General'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty || 'Medium'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors">
                      {quiz.title || `${quiz.category} Quiz`}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{quiz.totalQuestions || quiz.questionCount || 0} Questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~{((quiz.totalQuestions || quiz.questionCount || 0) * 30)}s</span>
                      </div>
                    </div>

                    {/* Choose Button */}
                    <button
                      onClick={() => handleSelectQuiz(quiz.id)}
                      className="w-full py-2.5 bg-lime-600 text-white rounded-lg font-bold hover:bg-lime-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      Choose Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
              </div>
            )}

            {/* Intersection Observer Target */}
            <div ref={observerTarget} className="h-4" />

            {/* End Message */}
            {!hasMore && displayedQuizzes.length > 0 && (
              <div className="text-center py-8">
                <p className="text-mauve/60">You've reached the end!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizSelection;
