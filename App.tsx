import React, { useState } from 'react';
import ChessGame from './components/ChessGame';
import { GameMode, Difficulty, GameSettings } from './types';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    mode: GameMode.MENU,
    difficulty: Difficulty.MEDIUM,
    timeControl: 10, // Default 10 mins
  });

  const startGame = (mode: GameMode) => {
    setSettings(prev => ({ ...prev, mode }));
    setIsPlaying(true);
  };

  const handleDifficultyChange = (level: Difficulty) => {
    setSettings(prev => ({ ...prev, difficulty: level }));
  };

  const handleTimeChange = (mins: number) => {
    setSettings(prev => ({ ...prev, timeControl: mins }));
  };

  if (isPlaying) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center py-8">
        <ChessGame
          settings={settings}
          onExit={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  // --- Main Menu ---
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600 rounded-full blur-[150px]"></div>
      </div>

      <div className="z-10 max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Cờ Vua Pro
          </h1>
          <p className="text-slate-400">Phiên bản Đại Kiện Tướng</p>
        </div>

        <div className="space-y-8">

          {/* Time Control Selection */}
          <div className="space-y-3">
            <label className="text-sm uppercase tracking-wider font-bold text-slate-500">Thời Gian (Phút)</label>
            <div className="flex gap-2">
              {[5, 10, 30].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTimeChange(t)}
                  className={`flex-1 py-2 rounded-lg border transition-all ${settings.timeControl === t
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                  {t}p
                </button>
              ))}
            </div>
          </div>

          {/* Single Player Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">

            <div className="flex items-center justify-between">
              <label className="text-sm uppercase tracking-wider font-bold text-slate-500">Đấu với ba Pháp</label>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(Difficulty[diff])}
                  className={`py-2 text-xs font-bold rounded-md transition-all border ${settings.difficulty === Difficulty[diff]
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                  {Difficulty[diff] === 'EASY' ? 'DỄ' : Difficulty[diff] === 'MEDIUM' ? 'THƯỜNG' : 'KHÓ'}
                </button>
              ))}
            </div>

            <button
              onClick={() => startGame(GameMode.PVC)}
              className="w-full py-4 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>
              Chơi với ba Pháp
            </button>
          </div>

          {/* Two Player Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-sm uppercase tracking-wider font-bold text-slate-500">Đấu với Bạn</label>
            <button
              onClick={() => startGame(GameMode.PVP)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Chơi với Bạn
            </button>
          </div>

        </div>
      </div>

      <p className="absolute bottom-4 text-slate-600 text-xs">Built with React, Chess.js & Tailwind</p>
    </div>
  );
};

export default App;