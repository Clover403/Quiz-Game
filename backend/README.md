# Quiz Game Backend

Backend untuk Multiplayer Quiz Game dengan Express.js, Socket.IO, dan Sequelize.

## 📁 Struktur Folder

```
backend/
├── config/              # Konfigurasi database
│   └── config.json
├── controllers/         # Logic untuk handle request
│   ├── authController.js
│   ├── roomController.js
│   └── quizController.js
├── helpers/            # Helper functions
│   ├── jwt.js          # JWT token helper
│   ├── bcrypt.js       # Password hashing
│   └── aiHelper.js     # AI integration untuk generate quiz
├── middleware/         # Express middleware
│   ├── authentication.js
│   └── authorization.js
├── migrations/         # Database migrations
│   └── 20251118061200-create-all-tables.js
├── models/            # Sequelize models
│   ├── user.js
│   ├── room.js
│   ├── quiz.js
│   ├── question.js
│   └── leaderboard.js
├── routes/            # API routes
│   ├── authRoutes.js
│   ├── roomRoutes.js
│   └── quizRoutes.js
├── socket/            # Socket.IO handlers
│   └── socketHandler.js
├── seeders/           # Database seeders
├── .env               # Environment variables
├── .gitignore
├── .sequelizerc       # Sequelize configuration
├── package.json
└── server.js          # Main server file
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Edit file `.env` dengan kredensial database Anda:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456
DATABASE_URL=postgresql://postgres:password@localhost:5432/quiz_game_dev

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=quiz_game_dev
DB_HOST=127.0.0.1
DB_DIALECT=postgres

# AI Configuration (untuk generate pertanyaan)
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-3.5-turbo

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 3. Setup Database

**Buat database:**

```bash
npx sequelize-cli db:create
```

**Jalankan migrations:**

```bash
npx sequelize-cli db:migrate
```

**Rollback migration (jika perlu):**

```bash
npx sequelize-cli db:migrate:undo
```

### 4. Jalankan Server

**Development mode (dengan auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Rooms

- `POST /api/rooms` - Buat room baru (protected)
- `GET /api/rooms/:id` - Get detail room
- `POST /api/rooms/join` - Join room dengan code
- `DELETE /api/rooms/:id` - Delete room (host only)
- `GET /api/rooms/:id/leaderboard` - Get leaderboard room

### Quizzes

- `GET /api/quizzes` - Get semua quizzes
- `GET /api/quizzes/:id` - Get detail quiz
- `POST /api/quizzes` - Buat quiz baru (protected)
- `POST /api/quizzes/generate` - Generate quiz dengan AI (protected)
- `DELETE /api/quizzes/:id` - Delete quiz (protected)

## 🔌 Socket.IO Events

### Client → Server

- `authenticate` - Authenticate socket connection dengan JWT token
- `createRoom` - Create room baru
- `joinRoom` - Join ke room dengan code
- `leaveRoom` - Leave dari room
- `startGame` - Mulai game (host only)
- `submitAnswer` - Submit jawaban
- `nextQuestion` - Request next question (host only)

### Server → Client

- `authenticated` - Konfirmasi authentication
- `playerJoined` - Ada player baru join
- `playerLeft` - Ada player yang leave
- `gameStarted` - Game dimulai, kirim question pertama
- `nextQuestion` - Kirim question berikutnya
- `answerResult` - Hasil jawaban (benar/salah) dan update leaderboard
- `gameFinished` - Game selesai, kirim final leaderboard

## 🗄️ Database Schema

### Users
- id (PK)
- username (unique)
- email (unique)
- password (hashed)
- avatar
- timestamps

### Rooms
- id (PK)
- code (unique, 6 chars)
- hostId (FK → Users)
- quizId (FK → Quizzes)
- maxPlayers
- status (waiting/playing/finished)
- currentQuestion
- players (JSON array)
- timestamps

### Quizzes
- id (PK)
- title
- description
- category
- difficulty (easy/medium/hard)
- isAIGenerated
- timestamps

### Questions
- id (PK)
- quizId (FK → Quizzes)
- question
- options (JSON array)
- correctAnswer (A/B/C/D)
- timeLimit
- points
- timestamps

### Leaderboards
- id (PK)
- roomId (FK → Rooms)
- userId (FK → Users)
- score
- correctAnswers
- timeBonus
- timestamps

## 🤖 AI Integration

Backend ini sudah terintegrasi dengan OpenAI untuk generate pertanyaan quiz secara otomatis.

**Cara menggunakan:**

```javascript
POST /api/quizzes/generate
{
  "category": "Science",
  "difficulty": "medium",
  "numberOfQuestions": 5
}
```

AI akan generate quiz dengan pertanyaan yang sesuai kategori dan difficulty level yang diminta.

**Note:** Anda perlu API key dari OpenAI. Daftar di https://platform.openai.com/

## 🔐 Authentication & Authorization

### Authentication (JWT)

Semua protected endpoints memerlukan JWT token di header:

```
Authorization: Bearer <your_jwt_token>
```

Token didapat setelah login/register dan berlaku selama 7 hari.

### Authorization

- **Room Host:** Hanya host yang bisa start game dan delete room
- **Room Member:** Player harus join room sebelum bisa ikut game

## 📝 Development Notes

### Helpers

- **jwt.js:** Generate dan verify JWT token
- **bcrypt.js:** Hash dan compare password
- **aiHelper.js:** Generate quiz questions dengan AI

### Middleware

- **authentication.js:** Verifikasi JWT token
- **authorization.js:** Check permissions (host, member, dll)

### Game Flow

1. Host create room → dapat room code
2. Players join room dengan code
3. Host pilih quiz dan start game
4. Server send questions satu per satu
5. Players submit answers
6. Server calculate scores dan update leaderboard
7. Game selesai → show final leaderboard

## 🐛 Troubleshooting

### Database connection error

Pastikan PostgreSQL sudah running dan kredensial di `.env` benar.

```bash
sudo service postgresql start
```

### Port already in use

Ganti PORT di `.env` atau kill process yang menggunakan port 5000:

```bash
lsof -ti:5000 | xargs kill -9
```

### AI API error

Pastikan OPENAI_API_KEY sudah diset dengan benar di `.env`. Jika tidak ada API key, sistem akan menggunakan fallback dummy questions.

## 📄 License

MIT

## 👥 Contributors

- Person 1: Authentication system
- Person 2: Room management & Socket.IO
- Person 3: Quiz gameplay & Leaderboard
