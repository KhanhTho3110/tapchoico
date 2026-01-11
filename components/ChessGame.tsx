import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { GameMode, PlayerColor, GameSettings } from '../types';
import GameControls from './GameControls';
import { getBestMove } from '../services/chessAI';

interface ChessGameProps {
  settings: GameSettings;
  onExit: () => void;
}

const ChessGame: React.FC<ChessGameProps> = ({ settings, onExit }) => {
  // Use a ref to keep the game logic independent of renders
  const gameRef = useRef(new Chess());

  // State for UI rendering
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PlayerColor | 'draw' | null>(null);
  const [inCheck, setInCheck] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // Promotion
  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionMove, setPromotionMove] = useState<{ from: string, to: string } | null>(null);

  // Timers
  const [timers, setTimers] = useState<{ [key in PlayerColor]: number }>({
    [PlayerColor.WHITE]: settings.timeControl * 60,
    [PlayerColor.BLACK]: settings.timeControl * 60,
  });
  const timerRef = useRef<number | null>(null);

  // --- Helpers ---

  // Update UI state from game instance
  const updateGameState = useCallback(() => {
    const game = gameRef.current;
    setFen(game.fen());
    setMoveHistory(game.history());
    setInCheck(game.inCheck());

    if (game.isGameOver()) {
      setGameOver(true);
      if (game.isCheckmate()) {
        setWinner(game.turn() === 'w' ? PlayerColor.BLACK : PlayerColor.WHITE);
      } else {
        setWinner('draw');
      }
    }
  }, []);

  const isPlayerTurn = useCallback(() => {
    const game = gameRef.current;
    if (game.isGameOver()) return false;
    if (settings.mode === GameMode.PVP) return true;
    return game.turn() === 'w'; // Player is always White in PVC for now
  }, [settings.mode]);

  // --- Move Logic ---

  const makeMove = useCallback((moveDetails: { from: string; to: string; promotion?: string }) => {
    const game = gameRef.current;

    try {
      // Create a temp instance to validate move first
      const tempGame = new Chess(game.fen());
      const moveResult = tempGame.move(moveDetails);

      if (!moveResult) return false;

      // If valid, execute on real game
      game.move(moveDetails);
      updateGameState();
      setMoveFrom(null);
      setOptionSquares({});
      return true;
    } catch (e) {
      return false;
    }
  }, [updateGameState]);

  // --- Interaction Handlers ---

  const getMoveOptions = (square: Square) => {
    const game = gameRef.current;
    const moves = game.moves({ square, verbose: true });

    if (moves.length === 0) {
      return;
    }

    const newSquares: Record<string, React.CSSProperties> = {};

    // Highlight selected piece
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.5)',
    };

    // Highlight moves
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to as Square) && game.get(move.to as Square).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(255,0,0,.5) 25%, transparent 25%)'
            : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',
        borderRadius: '50%',
        cursor: 'pointer',
      };
    });

    setOptionSquares(newSquares);
  };

  const handleSquareClick = (args: any) => {
    const square = args.square as Square;
    if (!isPlayerTurn()) {
      return;
    }

    // 1. Unselect if clicking same square
    if (moveFrom === square) {
      setMoveFrom(null);
      setOptionSquares({});
      return;
    }

    // 2. Attempt Move if a piece was already selected
    if (moveFrom) {
      const game = gameRef.current;
      const moves = game.moves({ square: moveFrom, verbose: true });
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

      if (foundMove) {
        // Check Promotion
        if ((foundMove.color === 'w' && foundMove.piece === 'p' && foundMove.to[1] === '8') ||
          (foundMove.color === 'b' && foundMove.piece === 'p' && foundMove.to[1] === '1')) {
          setPromotionMove({ from: moveFrom, to: square });
          setShowPromotion(true);
          return;
        }

        makeMove({ from: moveFrom, to: square });
        return;
      }
    }

    // 3. Select new piece
    const game = gameRef.current;
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setMoveFrom(square);
      getMoveOptions(square);
      return;
    }

    // 4. Clear if invalid click
    setMoveFrom(null);
    setOptionSquares({});
  };

  const onPieceDrop = (args: any) => {
    const { sourceSquare, targetSquare, piece } = args;
    if (!isPlayerTurn()) {
      return false;
    }

    // Check promotion manually for Drag & Drop
    const isWhitePromote = piece === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8';
    const isBlackPromote = piece === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1';

    if (isWhitePromote || isBlackPromote) {
      setPromotionMove({ from: sourceSquare, to: targetSquare });
      setShowPromotion(true);
      return false;
    }

    return makeMove({ from: sourceSquare, to: targetSquare });
  };

  const finishPromotion = (promotionPiece: 'q' | 'r' | 'b' | 'n') => {
    if (promotionMove) {
      makeMove({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: promotionPiece,
      });
      setShowPromotion(false);
      setPromotionMove(null);
    }
  };

  // --- AI Loop ---
  useEffect(() => {
    if (settings.mode === GameMode.PVC && gameRef.current.turn() === 'b' && !gameOver) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(gameRef.current, settings.difficulty);
        if (bestMove) {
          // getBestMove returns string or object, move() handles both
          const game = gameRef.current;
          game.move(bestMove);
          updateGameState();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fen, gameOver, settings.mode, settings.difficulty, updateGameState]);

  // --- Timer Loop ---
  useEffect(() => {
    if (gameOver) return;

    timerRef.current = window.setInterval(() => {
      setTimers((prev) => {
        const turn = gameRef.current.turn() === 'w' ? PlayerColor.WHITE : PlayerColor.BLACK;
        const newTime = prev[turn] - 1;

        if (newTime <= 0) {
          setGameOver(true);
          setWinner(turn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, [turn]: 0 };
        }
        return { ...prev, [turn]: newTime };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameOver]); // Removed 'fen' dep to avoid timer stutter, relies on ref for current turn

  // --- Control Actions ---
  const handleUndo = () => {
    const game = gameRef.current;
    if (settings.mode === GameMode.PVC) {
      // Undo twice for PVC
      game.undo();
      game.undo();
    } else {
      game.undo();
    }
    updateGameState();
    setMoveFrom(null);
    setOptionSquares({});
  };

  const handleReset = () => {
    const game = gameRef.current;
    game.reset();
    updateGameState();
    setMoveFrom(null);
    setOptionSquares({});
    setTimers({
      [PlayerColor.WHITE]: settings.timeControl * 60,
      [PlayerColor.BLACK]: settings.timeControl * 60,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-6 p-4 max-w-7xl mx-auto items-center lg:items-start justify-center relative">

      {/* Promotion Overlay */}
      {showPromotion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 shadow-2xl">
            <h3 className="text-xl text-white font-bold mb-6 text-center">Choose Promotion Piece</h3>
            <div className="flex gap-4">
              {[
                { id: 'q', label: 'Queen', char: '♕' },
                { id: 'r', label: 'Rook', char: '♖' },
                { id: 'b', label: 'Bishop', char: '♗' },
                { id: 'n', label: 'Knight', char: '♘' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => finishPromotion(p.id as any)}
                  className="w-20 h-20 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-5xl text-white flex items-center justify-center transition-transform hover:scale-105"
                >
                  {p.char}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 items-center">
        {/* Status Bar */}
        <div className="px-8 py-3 bg-slate-800 rounded-full border border-slate-600 shadow-lg">
          <span className="text-white font-bold tracking-widest uppercase text-sm">
            {gameOver
              ? "Kết Thúc"
              : (settings.mode === GameMode.PVC && gameRef.current.turn() === 'b')
                ? "ba Pháp đang suy nghĩ..."
                : (gameRef.current.turn() === 'w'
                  ? "Lượt Hạo Nhiên"
                  : (settings.mode === GameMode.PVC ? "Lượt ba Pháp" : "Lượt An Nhiên"))
            }
          </span>
        </div>

        {/* Board */}
        <div className={`relative rounded-lg shadow-2xl border-[8px] transition-colors ${inCheck ? 'border-red-500' : 'border-slate-700'}`}>
          {inCheck && !gameOver && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow-xl animate-bounce whitespace-nowrap z-10">
              CHIẾU TƯỚNG!
            </div>
          )}

          <div className="w-[85vw] h-[85vw] max-w-[600px] max-h-[600px]">
            <Chessboard
              options={{
                position: fen,
                onPieceDrop: onPieceDrop,
                onSquareClick: handleSquareClick,
                draggable: true,
                squareStyles: optionSquares,
                animationDuration: 200,
                boardOrientation: 'white',
                customDarkSquareStyle: { backgroundColor: '#334155' },
                customLightSquareStyle: { backgroundColor: '#94a3b8' },
              }}
            />
          </div>
        </div>

        <p className="text-slate-500 text-xs mt-2">
          Chọn quân cờ để xem các nước có thể đi. Nhấp vào ô để di chuyển.
        </p>
      </div>

      <div className="w-full lg:w-auto flex-1 lg:h-[600px]">
        <GameControls
          mode={settings.mode}
          difficulty={settings.difficulty}
          timers={timers}
          activePlayer={gameRef.current.turn() === 'w' ? PlayerColor.WHITE : PlayerColor.BLACK}
          moveHistory={moveHistory}
          onUndo={handleUndo}
          onReset={handleReset}
          onExit={onExit}
          gameOver={gameOver}
          winner={winner}
        />
      </div>

    </div>
  );
};

export default ChessGame;