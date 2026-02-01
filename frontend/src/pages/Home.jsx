import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Users, Trophy, ArrowRight, Zap, Target, Crown, Sparkles, UserPlus, LogIn, LayoutGrid } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen text-white overflow-hidden font-sans selection:bg-neon-pink selection:text-white relative">
      
      {/* Background Graphics (Floating Shapes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left Gradient Blob */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/8 rounded-full blur-[120px] animate-pulse-slow" />
        {/* Bottom Right Gradient Blob */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/8 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        
        {/* Floating Geometric Elements */}
        <div className="absolute top-[15%] left-[10%] w-16 h-16 border-2 border-white/10 rounded-2xl rotate-12 animate-float opacity-50" />
        <div className="absolute top-[40%] right-[15%] w-24 h-24 border-2 border-neon-pink/20 rounded-full animate-float delay-500 opacity-50" />
        <div className="absolute bottom-[20%] left-[20%] w-8 h-8 bg-blue-500/20 rotate-45 animate-float delay-200 opacity-50" />
        <div className="absolute top-[25%] right-[5%] w-4 h-4 bg-yellow-400/30 rounded-full animate-ping opacity-50" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[90vh] text-center pt-20 pb-16">
          <div className="relative inline-block mb-6 animate-bounce-slow">
            <div className="absolute inset-0 bg-neon-pink blur-xl opacity-20 rounded-full"></div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-400" />
              <span className="text-sm font-bold tracking-wide text-white uppercase">The Ultimate Quiz Battle</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-lime-500 drop-shadow-[0_0_15px_rgba(255,100,255,0.5)]">
              Level Up
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-lime-500 relative">
              Your Knowledge
              
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
            Challenge your friends, dominate the leaderboard, and prove your mastery in real-time battles.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
            <Link to="/create-room" className="group relative flex-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-300 to-cyan-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <button className="relative w-full h-full bg-[#16002A] rounded-2xl p-4 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-300 to-purple-600 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-400 font-medium">Host a Game</div>
                  <div className="text-xl font-bold text-white">Create Room</div>
                </div>
              </button>
            </Link>

            <Link to="/join-room" className="group relative flex-1">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-lime-300 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <button className="relative w-full h-full bg-[#16002A] rounded-2xl p-4 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center border border-cyan-500/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-400 font-medium">Join a Game</div>
                  <div className="text-xl font-bold text-white">Enter Code</div>
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* How to Play Section (Zig-Zag Layout) */}
        <div className="py-24 relative">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">How It <span className="text-neon-pink">Works</span></h2>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col gap-24">
                
                {/* Step 1: Left Image, Right Text */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 relative group w-full">
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-surface/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transform group-hover:rotate-1 transition duration-500">
                             {/* Mock UI: User Profile Card */}
                             <div className="bg-[#0f0418] rounded-xl p-6 border border-white/5 flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-800 to-blue-400 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-[#1a0b2e] overflow-hidden">
                                        <img 
                                            src="/ppp.jpg" 
                                            alt="User Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                                    <div className="h-3 w-20 bg-white/10 rounded"></div>
                                </div>
                                <div className="ml-auto bg-green-500/20 text-green-400 p-2 rounded-lg">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                             </div>
                             <div className="mt-4 flex gap-2">
                                <div className="h-3 w-full bg-white/5 rounded"></div>
                                <div className="h-3 w-2/3 bg-white/5 rounded"></div>
                             </div>
                        </div>
                    </div>
                    <div className="flex-1 text-left md:pl-10">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 font-bold text-2xl border border-blue-500/30">1</div>
                        <h3 className="text-3xl font-bold mb-4">Create Your Profile</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Start your journey by registering a new account. Build your unique identity, choose a cool avatar, and get ready to track your stats.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-300">
                                <Target className="w-5 h-5 text-blue-400" />
                                <span>Track your win rate and score</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <Target className="w-5 h-5 text-blue-400" />
                                <span>Customize your player card</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Step 2: Left Text, Right Image */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                     <div className="flex-1 relative group w-full">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-cyan-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-surface/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transform group-hover:-rotate-1 transition duration-500">
                             {/* Mock UI: Room Code Entry */}
                             <div className="bg-[#0f0418] rounded-xl p-8 border border-white/5 flex flex-col items-center gap-4">
                                <div className="text-gray-400 text-sm uppercase tracking-widest">Enter Code</div>
                                <div className="flex gap-2">
                                    {['A', 'K', '4', '7'].map((char, i) => (
                                        <div key={i} className="w-12 h-14 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xl font-mono font-bold text-white shadow-[0_0_10px_rgba(255,0,153,0.3)]">
                                            {char}
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full h-10 bg-gradient-to-r from-purple-600 to-cyan-300 rounded-lg mt-2 opacity-90 flex items-center justify-center">
                                    <span className="text-white font-mono font-bold text-sm tracking-wider shadow-sm">ENTER CODE ROOM</span>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="flex-1 text-left md:pr-10">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-300 font-bold text-2xl border border-neon-pink/30">2</div>
                        <h3 className="text-3xl font-bold mb-4">Join or Host a Room</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Want to be the Quizmaster? Create a room and invite your friends. Just want to play? Enter the code and jump straight into the lobby.
                        </p>
                         <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-300">
                                <LayoutGrid className="w-5 h-5 text-neon-pink" />
                                <span>Real-time lobby updates</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <LayoutGrid className="w-5 h-5 text-neon-pink" />
                                <span>Support for up to 50 players</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Step 3: Left Image, Right Text */}
                <div className="flex flex-col md:flex-row items-center gap-12">
                     <div className="flex-1 relative group w-full">
                        <div className="absolute -inset-2 bg-gradient-to-r from-lime-200 to-lime-500 rounded-2xl blur opacity-50 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-surface/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transform group-hover:rotate-1 transition duration-500">
                             {/* Mock UI: Leaderboard Snippet */}
                             <div className="bg-[#0f0418] rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-3 bg-lime-500/10 p-3 rounded-lg border border-lime-500/30 mb-2">
                                    <Trophy className="w-6 h-6 text-lime-500" />
                                    <span className="font-bold text-lime-500">1st Place</span>
                                    <span className="ml-auto font-mono text-white">2500 pts</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg mb-2 opacity-60">
                                    <span className="w-6 text-center text-gray-400">2</span>
                                    <span className="text-gray-300">Player Two</span>
                                    <span className="ml-auto font-mono text-gray-400">1800 pts</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg opacity-40">
                                     <span className="w-6 text-center text-gray-400">3</span>
                                    <span className="text-gray-300">Player Three</span>
                                    <span className="ml-auto font-mono text-gray-400">1200 pts</span>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="flex-1 text-left md:pl-10">
                         <div className="w-12 h-12 bg-lime-500/20 rounded-xl flex items-center justify-center mb-6 text-lime-500 font-bold text-2xl border border-yellow-500/30">3</div>
                        <h3 className="text-3xl font-bold mb-4">Compete & Win</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Speed and accuracy are key. Answer questions faster than your opponents to earn more points and claim the crown!
                        </p>
                        <div className="flex gap-4">
                             <div className=" p-4 rounded-xl border border-white/10 text-center flex-1">
                                <Zap className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                                <div className="text-sm text-gray-400">Fast Pace</div>
                             </div>
                             <div className=" p-4 rounded-xl border border-white/10 text-center flex-1">
                                <Trophy className="w-6 h-6 text-lime-400 mx-auto mb-2" />
                                <div className="text-sm text-gray-400">Rewards</div>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Footer Area */}
        <div className="text-center py-16 border-t border-white/5">
            <h2 className="text-3xl font-bold mb-6">Ready to start?</h2>
            {isAuthenticated ? (
              <Link to="/create-room" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(255,0,153,0.5)] transition-all">
                  Create Room <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/register" className="inline-flex items-center gap-2 bg-lime-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-lime-700 transition">
                  Create Account <ArrowRight className="w-5 h-5" />
              </Link>
            )}
        </div>

      </div>
    </div>
  );
};

export default Home;
