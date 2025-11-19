# 🎵 Audio System Implementation

## Overview
Sistem musik telah diimplementasikan untuk meningkatkan pengalaman bermain quiz game dengan musik latar saat bermain dan musik kemenangan saat melihat hasil.

## File yang Dibuat/Dimodifikasi

### 1. AudioContext.jsx (`/frontend/src/context/AudioContext.jsx`)
Context provider untuk mengelola audio di seluruh aplikasi:
- `playGameMusic()` - Memutar musik saat quiz dimulai
- `playVictoryMusic()` - Memutar musik kemenangan di halaman hasil
- `stopAllMusic()` - Menghentikan semua musik yang sedang diputar
- Volume control untuk game (30%) dan victory music (50%)

### 2. App.jsx
Ditambahkan `<AudioProvider>` wrapper di sekitar aplikasi.

### 3. Game.jsx
- Import `useAudio` hook
- Memutar musik saat game dimulai (`game-started` event)
- Menghentikan musik saat game selesai (`gameFinished` event)
- Cleanup: Stop musik saat keluar dari halaman

### 4. Results.jsx
- Import `useAudio` hook
- Memutar musik kemenangan saat hasil dimuat
- Menghentikan musik saat kembali ke home
- Cleanup: Stop musik saat keluar dari halaman

### 5. Folder Musik (`/frontend/public/music/`)
- `README.md` - Panduan download dan penggunaan musik
- `.gitkeep` - Menjaga folder tetap ada di git
- File musik tidak di-commit (`.gitignore`)

## Cara Kerja

### Flow Musik:
```
1. Home Page → TIDAK ADA MUSIK ✅
2. User membuat/join room → TIDAK ADA MUSIK
3. Room Lobby → TIDAK ADA MUSIK
4. Game dimulai → 🎵 GAME MUSIC MULAI (loop)
5. Game selesai → 🔇 MUSIK BERHENTI
6. Results page → 🎉 VICTORY MUSIC (play once)
7. Kembali ke Home → 🔇 MUSIK BERHENTI
```

### Event Listeners:
- **Game Page**: 
  - `socket.on('game-started')` → `playGameMusic()`
  - `socket.on('gameFinished')` → `stopAllMusic()`
  - Component unmount → `stopAllMusic()`

- **Results Page**:
  - `fetchResults()` success → `playVictoryMusic()`
  - `handleBackToHome()` → `stopAllMusic()`
  - Component unmount → `stopAllMusic()`

## Setup Musik

### Option 1: Menggunakan File Musik Sendiri
1. Download musik dari sumber gratis:
   - https://incompetech.com/ (Kevin MacLeod)
   - https://pixabay.com/music/
   - https://freemusicarchive.org/

2. Rename file menjadi:
   - `game-music.mp3` (untuk musik saat quiz)
   - `victory-music.mp3` (untuk musik kemenangan)

3. Letakkan file di: `/frontend/public/music/`

### Option 2: Menggunakan URL External
Edit `AudioContext.jsx` untuk menggunakan URL:
```javascript
gameAudioRef.current = new Audio('https://example.com/game-music.mp3');
victoryAudioRef.current = new Audio('https://example.com/victory-music.mp3');
```

## Testing

### Tanpa File Musik:
✅ Aplikasi tetap berjalan normal
✅ Console akan menampilkan error tapi tidak break
✅ Semua fitur lain tetap bekerja

### Dengan File Musik:
✅ Musik game mulai saat quiz dimulai
✅ Musik game berhenti saat quiz selesai
✅ Musik victory mulai saat hasil muncul
✅ Musik berhenti saat kembali ke home
✅ Tidak ada musik di home page

## Technical Details

### Audio Properties:
- **Game Music**: 
  - Loop: true
  - Volume: 0.3 (30%)
  - Format: MP3
  
- **Victory Music**:
  - Loop: false (play once)
  - Volume: 0.5 (50%)
  - Format: MP3

### Browser Compatibility:
- Chrome ✅
- Firefox ✅
- Safari ✅ (may need user interaction first)
- Edge ✅

### Notes:
- Musik memerlukan user interaction pertama kali (autoplay policy)
- File musik di-ignore dari git untuk menghemat space
- Gunakan file musik dengan lisensi yang sesuai

## Rekomendasi Musik

### Game Music (upbeat, energetic, 2-5 menit):
1. "Wallpaper" - Kevin MacLeod
2. "Cipher" - Kevin MacLeod
3. "Pixel Peeker Polka" - Kevin MacLeod

### Victory Music (celebratory, 15-30 detik):
1. "Fanfare for Space" - Kevin MacLeod
2. "Winner Winner!" - Kevin MacLeod
3. "Heroic Adventure" - Kevin MacLeod

## Future Improvements
- [ ] Add volume slider untuk user
- [ ] Add mute button
- [ ] Save audio preferences ke localStorage
- [ ] Add more sound effects (button clicks, correct/wrong answer)
- [ ] Add music selection option
