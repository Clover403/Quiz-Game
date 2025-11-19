import { createContext, useContext, useRef, useEffect, useState } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const gameAudioRef = useRef(null);
  const victoryAudioRef = useRef(null);
  const [isGameMusicPlaying, setIsGameMusicPlaying] = useState(false);
  const [isVictoryMusicPlaying, setIsVictoryMusicPlaying] = useState(false);

  useEffect(() => {
    // Initialize audio elements
    gameAudioRef.current = new Audio('/music/inGame.mp3');
    victoryAudioRef.current = new Audio('/music/gameEnd.mp3');

    // Set audio properties
    gameAudioRef.current.loop = true;
    gameAudioRef.current.volume = 0.3;
    
    victoryAudioRef.current.loop = false;
    victoryAudioRef.current.volume = 0.5;

    return () => {
      // Cleanup
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
        gameAudioRef.current = null;
      }
      if (victoryAudioRef.current) {
        victoryAudioRef.current.pause();
        victoryAudioRef.current = null;
      }
    };
  }, []);

  const playGameMusic = () => {
    try {
      console.log('🎮 Attempting to play game music...');
      
      // Stop victory music if playing
      if (victoryAudioRef.current && !victoryAudioRef.current.paused) {
        victoryAudioRef.current.pause();
        victoryAudioRef.current.currentTime = 0;
        setIsVictoryMusicPlaying(false);
      }
      
      // Don't restart if already playing
      if (gameAudioRef.current && !gameAudioRef.current.paused) {
        console.log('⏯️ Game music already playing, skipping...');
        return;
      }
      
      if (gameAudioRef.current) {
        gameAudioRef.current.currentTime = 0;
        const playPromise = gameAudioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsGameMusicPlaying(true);
              console.log('✅ Game music started successfully!');
            })
            .catch(err => {
              console.error('❌ Error playing game music:', err);
              console.log('💡 Try clicking on the page first (browser autoplay policy)');
            });
        }
      } else {
        console.error('❌ Game audio ref is null');
      }
    } catch (error) {
      console.error('❌ Error in playGameMusic:', error);
    }
  };

  const playVictoryMusic = () => {
    try {
      console.log('🎉 Attempting to play victory music...');
      
      // Stop game music if playing
      if (gameAudioRef.current && !gameAudioRef.current.paused) {
        gameAudioRef.current.pause();
        gameAudioRef.current.currentTime = 0;
        setIsGameMusicPlaying(false);
      }
      
      if (victoryAudioRef.current) {
        victoryAudioRef.current.currentTime = 0;
        const playPromise = victoryAudioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsVictoryMusicPlaying(true);
              console.log('✅ Victory music started successfully!');
            })
            .catch(err => {
              console.error('❌ Error playing victory music:', err);
              console.log('💡 Try clicking on the page first (browser autoplay policy)');
            });
        }
      } else {
        console.error('❌ Victory audio ref is null');
      }
    } catch (error) {
      console.error('❌ Error in playVictoryMusic:', error);
    }
  };

  const stopAllMusic = () => {
    try {
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
        gameAudioRef.current.currentTime = 0;
        setIsGameMusicPlaying(false);
      }
      if (victoryAudioRef.current) {
        victoryAudioRef.current.pause();
        victoryAudioRef.current.currentTime = 0;
        setIsVictoryMusicPlaying(false);
      }
      console.log('🔇 All music stopped');
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  };

  const setGameVolume = (volume) => {
    if (gameAudioRef.current) {
      gameAudioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const setVictoryVolume = (volume) => {
    if (victoryAudioRef.current) {
      victoryAudioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const value = {
    playGameMusic,
    playVictoryMusic,
    stopAllMusic,
    setGameVolume,
    setVictoryVolume,
    isGameMusicPlaying,
    isVictoryMusicPlaying,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
