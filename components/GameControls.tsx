import React from 'react';
import { PlayerColor, Difficulty, GameMode } from '../types';

interface GameControlsProps {
  mode: GameMode;
  difficulty: Difficulty;
  timers: { [key in PlayerColor]: number };
  activePlayer: PlayerColor;
  moveHistory: string[];
  onUndo: () => void;
  onReset: () => void;
  onExit: () => void;
  gameOver: boolean;
  winner: PlayerColor | 'draw' | null;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const GameControls: React.FC<GameControlsProps> = ({
  mode,
  difficulty,
  timers,
  activePlayer,
  moveHistory,
  onUndo,
  onReset,
  onExit,
  gameOver,
  winner,
}) => {
  return (
    <div className="flex flex-col h-full w-full lg:w-80 bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">

      {/* Header Info */}
      <div className="p-6 bg-slate-900 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white mb-2">
          {mode === GameMode.PVP ? 'Hai Người Chơi' : 'Đấu Với ba Pháp'}
        </h2>
        {mode === GameMode.PVC && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Độ khó: {difficulty}
          </div>
        )}
      </div>

      {/* Timers */}
      <div className="flex flex-col gap-4 p-6 bg-slate-800">

        {/* Black Timer */}
        <div className={`flex justify-between items-center p-4 rounded-lg border-2 transition-all ${activePlayer === PlayerColor.BLACK && !gameOver
          ? 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          : 'border-slate-700 bg-slate-900/50'
          }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400">
              {mode === GameMode.PVC ? 'BP' : 'AN'}
            </div>
            <span className="text-slate-300 font-medium">
              {mode === GameMode.PVC ? 'ba Pháp' : 'An Nhiên'}
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-white tracking-widest">
            {formatTime(timers[PlayerColor.BLACK])}
          </span>
        </div>

        {/* White Timer */}
        <div className={`flex justify-between items-center p-4 rounded-lg border-2 transition-all ${activePlayer === PlayerColor.WHITE && !gameOver
          ? 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          : 'border-slate-700 bg-slate-900/50'
          }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-900">HN</div>
            <span className="text-slate-300 font-medium">Hạo Nhiên</span>
          </div>
          <span className="text-2xl font-mono font-bold text-white tracking-widest">
            {formatTime(timers[PlayerColor.WHITE])}
          </span>
        </div>

      </div>

      {/* Game Status Message */}
      {gameOver && (
        <div className="mx-6 p-4 rounded-lg bg-indigo-600 text-white text-center animate-pulse shadow-lg">
          <h3 className="font-bold text-lg">Kết Thúc</h3>
          <p className="text-sm opacity-90">
            {winner === 'draw'
              ? 'Hòa!'
              : `${winner === PlayerColor.WHITE ? 'Hạo Nhiên' : (mode === GameMode.PVC ? 'ba Pháp' : 'An Nhiên')} Thắng!`}
          </p>
        </div>
      )}

      {/* Move History */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[150px] bg-slate-900/30 border-y border-slate-700">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Lịch Sử Nước Đi</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {moveHistory.reduce((rows: any[], move, index) => {
            if (index % 2 === 0) {
              rows.push([`${Math.floor(index / 2) + 1}.`, move]);
            } else {
              rows[rows.length - 1].push(move);
            }
            return rows;
          }, []).map((row, i) => (
            <React.Fragment key={i}>
              <div className="text-slate-400 text-right pr-2">{row[0]}</div>
              <div className="flex gap-4">
                <span className="font-medium text-slate-200 w-12">{row[1]}</span>
                {row[2] && <span className="font-medium text-slate-200">{row[2]}</span>}
              </div>
            </React.Fragment>
          ))}
          <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-slate-900 mt-auto grid grid-cols-3 gap-2">
        <button
          onClick={onUndo}
          disabled={gameOver || (mode === GameMode.PVC && activePlayer === PlayerColor.BLACK)}
          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-200 font-semibold transition-colors flex flex-col items-center gap-1 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
          Đi Lại
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-white font-semibold transition-colors flex flex-col items-center gap-1 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
          Chơi Lại
        </button>
        <button
          onClick={onExit}
          className="px-4 py-3 bg-rose-700 hover:bg-rose-600 rounded-lg text-white font-semibold transition-colors flex flex-col items-center gap-1 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
          Thoát
        </button>
      </div>
    </div>
  );
};

export default GameControls;