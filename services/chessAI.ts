import { Chess } from 'chess.js';
import { Difficulty } from '../types';

// Piece weights for evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

// Evaluate board position (positive = white advantage, negative = black advantage)
const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type] || 0;
        totalEvaluation += piece.color === 'w' ? value : -value;
      }
    }
  }
  return totalEvaluation;
};

// Minimax algorithm with Alpha-Beta pruning
const minimax = (
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves();

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getBestMove = (game: Chess, difficulty: Difficulty): string | null => {
  try {
      const moves = game.moves();
      if (moves.length === 0) return null;

      // Easy: Random move
      if (difficulty === Difficulty.EASY) {
        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
      }

      // Medium/Hard: Use Minimax
      // Depth 2 for Medium, Depth 3 for Hard (Depth 4 in JS might cause lag without web workers)
      const depth = difficulty === Difficulty.MEDIUM ? 2 : 3;
      
      // Computer plays Black usually in this simple setup
      const isMaximizing = game.turn() === 'w'; 
      
      let bestMoveFound: string | null = null;
      let bestValue = isMaximizing ? -Infinity : Infinity;

      // Shuffle moves to add a tiny bit of variety if scores are equal
      const shuffledMoves = moves.sort(() => Math.random() - 0.5);

      for (const move of shuffledMoves) {
        game.move(move);
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
        game.undo();

        if (isMaximizing) {
          if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMoveFound = move;
          }
        } else {
          if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMoveFound = move;
          }
        }
      }

      return bestMoveFound || moves[0];
  } catch (error) {
    console.error("AI Error:", error);
    // Fallback to random move
    const moves = game.moves();
    return moves.length > 0 ? moves[0] : null;
  }
};