const { Room, User, Leaderboard, Question } = require('../models');
const { verifyToken } = require('../helpers/jwt');

// Store active rooms and their states
const activeRooms = new Map();

/**
 * Main socket connection handler
 */
const handleSocketConnection = (io, socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.emit('authenticated', { success: true, userId: decoded.id });
    } catch (error) {
      socket.emit('authenticated', { success: false, message: 'Invalid token' });
    }
  });

  // Create room
  socket.on('createRoom', async (data, callback) => {
    try {
      const { roomId } = data;
      
      const room = await Room.findByPk(roomId, {
        include: [
          { model: User, as: 'host', attributes: ['id', 'username', 'avatar'] }
        ]
      });

      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      // Join socket room
      socket.join(`room_${room.code}`);
      socket.roomCode = room.code;
      
      // Initialize room state if not exists
      if (!activeRooms.has(room.code)) {
        activeRooms.set(room.code, {
          roomId: room.id,
          players: new Map(),
          currentQuestion: 0,
          status: room.status
        });
      }

      callback({ success: true, room });
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Join room
  socket.on('joinRoom', async (data, callback) => {
    try {
      const { roomCode, userId } = data;

      const room = await Room.findOne({
        where: { code: roomCode },
        include: [
          { model: User, as: 'host', attributes: ['id', 'username', 'avatar'] }
        ]
      });

      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      if (room.status !== 'waiting') {
        return callback({ success: false, message: 'Game already started' });
      }

      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'avatar']
      });

      if (!user) {
        return callback({ success: false, message: 'User not found' });
      }

      // Add player to room
      const players = room.players || [];
      if (!players.includes(userId) && room.hostId !== userId) {
        players.push(userId);
        await room.update({ players });
      }

      // Join socket room
      socket.join(`room_${roomCode}`);
      socket.roomCode = roomCode;
      socket.userId = userId;

      // Update active room state
      if (!activeRooms.has(roomCode)) {
        activeRooms.set(roomCode, {
          roomId: room.id,
          players: new Map(),
          currentQuestion: 0,
          status: room.status
        });
      }

      const roomState = activeRooms.get(roomCode);
      roomState.players.set(userId, {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        score: 0,
        socketId: socket.id
      });

      // Notify all players in room
      io.to(`room_${roomCode}`).emit('playerJoined', {
        player: user,
        players: Array.from(roomState.players.values())
      });

      callback({ success: true, room, player: user });
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Leave room
  socket.on('leaveRoom', async (data, callback) => {
    try {
      const { roomCode, userId } = data;

      if (socket.roomCode) {
        socket.leave(`room_${socket.roomCode}`);
      }

      const roomState = activeRooms.get(roomCode);
      if (roomState) {
        roomState.players.delete(userId);
        
        io.to(`room_${roomCode}`).emit('playerLeft', {
          userId,
          players: Array.from(roomState.players.values())
        });
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error leaving room:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Start game
  socket.on('startGame', async (data, callback) => {
    try {
      const { roomCode } = data;

      const room = await Room.findOne({
        where: { code: roomCode },
        include: [
          { 
            model: require('../models').Quiz, 
            as: 'quiz',
            include: [{ model: Question, as: 'questions' }]
          }
        ]
      });

      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }

      if (!room.quiz || !room.quiz.questions || room.quiz.questions.length === 0) {
        return callback({ success: false, message: 'No quiz assigned to this room' });
      }

      // Update room status
      await room.update({ 
        status: 'playing',
        currentQuestion: 1
      });

      const roomState = activeRooms.get(roomCode);
      if (roomState) {
        roomState.status = 'playing';
        roomState.currentQuestion = 0;
      }

      // Send first question
      const firstQuestion = room.quiz.questions[0];
      const questionData = {
        id: firstQuestion.id,
        question: firstQuestion.question,
        options: firstQuestion.options,
        timeLimit: firstQuestion.timeLimit,
        points: firstQuestion.points,
        questionNumber: 1,
        totalQuestions: room.quiz.questions.length
      };

      io.to(`room_${roomCode}`).emit('gameStarted', {
        quiz: {
          id: room.quiz.id,
          title: room.quiz.title,
          totalQuestions: room.quiz.questions.length
        },
        question: questionData
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error starting game:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Submit answer
  socket.on('submitAnswer', async (data, callback) => {
    try {
      const { roomCode, userId, questionId, answer, timeRemaining } = data;

      const question = await Question.findByPk(questionId);
      if (!question) {
        return callback({ success: false, message: 'Question not found' });
      }

      const isCorrect = answer === question.correctAnswer;
      let points = 0;
      let timeBonus = 0;

      if (isCorrect) {
        points = question.points;
        // Calculate time bonus (faster answer = more bonus)
        timeBonus = Math.floor((timeRemaining / question.timeLimit) * 50);
        points += timeBonus;
      }

      // Update leaderboard
      const room = await Room.findOne({ where: { code: roomCode } });
      let leaderboardEntry = await Leaderboard.findOne({
        where: { roomId: room.id, userId }
      });

      if (leaderboardEntry) {
        await leaderboardEntry.update({
          score: leaderboardEntry.score + points,
          correctAnswers: isCorrect ? leaderboardEntry.correctAnswers + 1 : leaderboardEntry.correctAnswers,
          timeBonus: leaderboardEntry.timeBonus + timeBonus
        });
      } else {
        leaderboardEntry = await Leaderboard.create({
          roomId: room.id,
          userId,
          score: points,
          correctAnswers: isCorrect ? 1 : 0,
          timeBonus
        });
      }

      // Get updated leaderboard
      const leaderboard = await Leaderboard.findAll({
        where: { roomId: room.id },
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
        order: [['score', 'DESC']]
      });

      // Broadcast answer result to room
      io.to(`room_${roomCode}`).emit('answerResult', {
        userId,
        isCorrect,
        points,
        timeBonus,
        leaderboard
      });

      callback({ success: true, isCorrect, points, timeBonus });
    } catch (error) {
      console.error('Error submitting answer:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Next question
  socket.on('nextQuestion', async (data, callback) => {
    try {
      const { roomCode } = data;

      const room = await Room.findOne({
        where: { code: roomCode },
        include: [
          { 
            model: require('../models').Quiz, 
            as: 'quiz',
            include: [{ model: Question, as: 'questions' }]
          }
        ]
      });

      const nextQuestionIndex = room.currentQuestion;
      
      if (nextQuestionIndex >= room.quiz.questions.length) {
        // Game finished
        await room.update({ status: 'finished' });

        const finalLeaderboard = await Leaderboard.findAll({
          where: { roomId: room.id },
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
          order: [['score', 'DESC']]
        });

        io.to(`room_${roomCode}`).emit('gameFinished', {
          leaderboard: finalLeaderboard
        });

        return callback({ success: true, finished: true });
      }

      // Send next question
      const question = room.quiz.questions[nextQuestionIndex];
      await room.update({ currentQuestion: nextQuestionIndex + 1 });

      const questionData = {
        id: question.id,
        question: question.question,
        options: question.options,
        timeLimit: question.timeLimit,
        points: question.points,
        questionNumber: nextQuestionIndex + 1,
        totalQuestions: room.quiz.questions.length
      };

      io.to(`room_${roomCode}`).emit('nextQuestion', questionData);

      callback({ success: true, question: questionData });
    } catch (error) {
      console.error('Error getting next question:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    // Clean up: remove player from active room
    if (socket.roomCode && socket.userId) {
      const roomState = activeRooms.get(socket.roomCode);
      if (roomState) {
        roomState.players.delete(socket.userId);
        
        io.to(`room_${socket.roomCode}`).emit('playerLeft', {
          userId: socket.userId,
          players: Array.from(roomState.players.values())
        });
      }
    }
  });
};

module.exports = { handleSocketConnection };
