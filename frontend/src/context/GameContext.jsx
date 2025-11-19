import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  // Room state
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  // Game state
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [myScore, setMyScore] = useState(0);

  // Quiz info
  const [quiz, setQuiz] = useState(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Player joined
    socket.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      setPlayers(data.players || []);
    });

    // Player left
    socket.on('playerLeft', (data) => {
      console.log('Player left:', data);
      setPlayers(data.players || []);
    });

    // Game started
    socket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setGameStatus('playing');
      setQuiz(data.quiz);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.question.questionNumber);
      setTotalQuestions(data.question.totalQuestions);
      setTimeRemaining(data.question.timeLimit);
      setHasAnswered(false);
      setSelectedAnswer(null);
    });

    // Next question
    socket.on('nextQuestion', (data) => {
      console.log('Next question:', data);
      setCurrentQuestion(data);
      setQuestionNumber(data.questionNumber);
      setTimeRemaining(data.timeLimit);
      setHasAnswered(false);
      setSelectedAnswer(null);
    });

    // Answer result
    socket.on('answerResult', (data) => {
      console.log('Answer result:', data);
      setLeaderboard(data.leaderboard || []);
      
      // Update my score
      if (user) {
        const myEntry = data.leaderboard.find(entry => entry.userId === user.id);
        if (myEntry) {
          setMyScore(myEntry.score);
        }
      }
    });

    // Game finished
    socket.on('gameFinished', (data) => {
      console.log('Game finished:', data);
      setGameStatus('finished');
      setLeaderboard(data.leaderboard || []);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('gameStarted');
      socket.off('nextQuestion');
      socket.off('answerResult');
      socket.off('gameFinished');
    };
  }, [socket, user]);

  // Timer countdown
  useEffect(() => {
    if (gameStatus === 'playing' && timeRemaining > 0 && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeRemaining, gameStatus, hasAnswered]);

  // Join room
  const joinRoom = (roomCode) => {
    return new Promise((resolve) => {
      if (!socket || !user) {
        resolve({ success: false, message: 'Socket not connected or user not authenticated' });
        return;
      }

      socket.emit('joinRoom', { roomCode, userId: user.id }, (response) => {
        if (response.success) {
          setRoom(response.room);
          setIsHost(response.room.hostId === user.id);
        }
        resolve(response);
      });
    });
  };

  // Leave room
  const leaveRoom = (roomCode) => {
    return new Promise((resolve) => {
      if (!socket || !user) {
        resolve({ success: false });
        return;
      }

      socket.emit('leaveRoom', { roomCode, userId: user.id }, (response) => {
        if (response.success) {
          resetGameState();
        }
        resolve(response);
      });
    });
  };

  // Start game (host only)
  const startGame = (roomCode) => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, message: 'Socket not connected' });
        return;
      }

      socket.emit('startGame', { roomCode }, (response) => {
        resolve(response);
      });
    });
  };

  // Submit answer
  const submitAnswer = (roomCode, questionId, answer) => {
    return new Promise((resolve) => {
      if (!socket || !user) {
        resolve({ success: false });
        return;
      }

      setHasAnswered(true);
      setSelectedAnswer(answer);

      socket.emit('submitAnswer', {
        roomCode,
        userId: user.id,
        questionId,
        answer,
        timeRemaining
      }, (response) => {
        resolve(response);
      });
    });
  };

  // Next question (host only)
  const requestNextQuestion = (roomCode) => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false });
        return;
      }

      socket.emit('nextQuestion', { roomCode }, (response) => {
        resolve(response);
      });
    });
  };

  // Reset game state
  const resetGameState = () => {
    setRoom(null);
    setPlayers([]);
    setIsHost(false);
    setGameStatus('waiting');
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setTimeRemaining(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setLeaderboard([]);
    setMyScore(0);
    setQuiz(null);
  };

  const value = {
    // Room
    room,
    players,
    isHost,

    // Game
    gameStatus,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeRemaining,
    selectedAnswer,
    hasAnswered,
    quiz,

    // Leaderboard
    leaderboard,
    myScore,

    // Actions
    joinRoom,
    leaveRoom,
    startGame,
    submitAnswer,
    requestNextQuestion,
    resetGameState
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export default GameContext;
