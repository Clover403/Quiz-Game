import { useEffect, useState } from 'react';

const GlobalBackground = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          size: Math.random() * 2 + 1 + 'px',
          animationDuration: Math.random() * 3 + 2 + 's',
          animationDelay: Math.random() * 2 + 's',
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Space Background Overlay to ensure consistency */}
      <div className="absolute inset-0 bg-[#16002A]/90 mix-blend-multiply" />
      
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-60 animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDuration: star.animationDuration,
            animationDelay: star.animationDelay,
          }}
        />
      ))}

      {/* Floating Geometric Shapes (Graphics) */}
      <div className="absolute top-[10%] left-[5%] w-12 h-12 border-2 border-neon-pink/20 rotate-12 animate-float opacity-30" />
      <div className="absolute bottom-[20%] right-[10%] w-20 h-20 border-2 border-cyan-500/20 rounded-full animate-float delay-700 opacity-30" />
      <div className="absolute top-[40%] right-[20%] w-8 h-8 bg-yellow-400/10 rotate-45 animate-float delay-500 opacity-30" />
      <div className="absolute bottom-[10%] left-[15%] w-16 h-16 border border-purple-500/30 rotate-[30deg] animate-float delay-1000 opacity-30" />
      
      {/* Triangles */}
      <div className="absolute top-[30%] left-[25%] w-0 h-0 border-l-[15px] border-l-transparent border-b-[26px] border-b-green-400/20 border-r-[15px] border-r-transparent rotate-[-15deg] animate-float delay-200 opacity-30" />
      <div className="absolute bottom-[40%] right-[35%] w-0 h-0 border-l-[10px] border-l-transparent border-b-[18px] border-b-blue-400/20 border-r-[10px] border-r-transparent rotate-[45deg] animate-float delay-300 opacity-30" />

      {/* Crosses/Plus */}
      <div className="absolute top-[60%] left-[8%] text-white/10 text-4xl font-bold animate-pulse">+</div>

      {/* Logo Watermark */}
      <div className="absolute bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] opacity-[0.03] select-none pointer-events-none flex items-center justify-center transform -rotate-12 translate-x-10 translate-y-10">
         <svg viewBox="0 0 200 200" fill="currentColor" className="text-white w-full h-full">
            <path d="M100 20 L180 180 L20 180 Z" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="100" cy="110" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="80" y="80" width="40" height="60" stroke="currentColor" strokeWidth="2" fill="none" transform="rotate(45 100 110)" />
         </svg>
      </div>
      
       {/* Game Logo Top Right Watermark */}
       <div className="absolute top-4 right-4 opacity-10">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
             <path d="M12 2L2 7L12 12L22 7L12 2Z" />
             <path d="M2 17L12 22L22 17" />
             <path d="M2 12L12 17L22 12" />
          </svg>
       </div>

    </div>
  );
};

export default GlobalBackground;
