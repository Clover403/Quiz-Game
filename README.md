# 🎮 Multiplayer Quiz Game

Real-time multiplayer quiz game dengan Express.js, Socket.IO, React, dan AI-generated questions.

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### 🎵 Music Setup (Optional)
The app supports background music during gameplay and victory music on results page:
1. Download music files from free resources (see `frontend/public/music/README.md`)
2. Add files to `frontend/public/music/`:
   - `game-music.mp3` - Plays during quiz (looped)
   - `victory-music.mp3` - Plays on results page (once)
3. The app works fine without music files

## 📚 Full Documentation

Lihat dokumentasi lengkap di:
- [Backend README](./backend/README.md)
- Setup instructions
- API endpoints
- Database schema

## 🛠️ Tech Stack

- **Backend**: Express.js, Socket.IO, Sequelize, PostgreSQL
- **Frontend**: React, Vite, Socket.IO Client
- **Auth**: JWT + Bcrypt
- **AI**: OpenAI API untuk generate questions

## 👥 Team

Branch strategy: `develop` → feature branches → Pull Request

---

Made with ❤️ using React + Express
