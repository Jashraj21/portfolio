import { useEffect, useRef, useState, useCallback } from 'react';
import { soundFx } from './soundEffects';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame({ onClose }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('jashraaj_snake_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const gameState = useRef({
    snake: [...INITIAL_SNAKE],
    direction: { ...INITIAL_DIRECTION },
    nextDirection: { ...INITIAL_DIRECTION },
    food: { x: 5, y: 5 },
    speed: 110,
    running: true,
  });

  const generateFood = useCallback((snake) => {
    let newFood;
    while (!newFood || snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      snake: [...INITIAL_SNAKE],
      direction: { ...INITIAL_DIRECTION },
      nextDirection: { ...INITIAL_DIRECTION },
      food: generateFood(INITIAL_SNAKE),
      speed: 110,
      running: true,
    };
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, [generateFood]);

  const changeDirection = useCallback((dx, dy) => {
    const cur = gameState.current.direction;
    // Disallow reversing into self
    if (cur.x + dx === 0 && cur.y + dy === 0) return;
    gameState.current.nextDirection = { x: dx, y: dy };
    soundFx.playKey();
  }, []);

  useEffect(() => {
    gameState.current.food = generateFood(gameState.current.snake);

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        onClose();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (gameOver) {
          resetGame();
        } else {
          setIsPaused((p) => !p);
        }
        return;
      }

      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, gameOver, generateFood, isPaused, onClose, resetGame]);

  // Main game loop
  useEffect(() => {
    let timerId;

    const tick = () => {
      if (gameOver || isPaused || !gameState.current.running) return;

      const state = gameState.current;
      state.direction = state.nextDirection;

      const head = {
        x: state.snake[0].x + state.direction.x,
        y: state.snake[0].y + state.direction.y,
      };

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        state.running = false;
        setGameOver(true);
        soundFx.playDie();
        return;
      }

      // Self collision
      if (state.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        state.running = false;
        setGameOver(true);
        soundFx.playDie();
        return;
      }

      const newSnake = [head, ...state.snake];

      // Check food
      if (head.x === state.food.x && head.y === state.food.y) {
        soundFx.playBite();
        const newScore = newSnake.length - INITIAL_SNAKE.length;
        setScore(newScore);
        setHighScore((prev) => {
          const next = Math.max(prev, newScore);
          localStorage.setItem('jashraaj_snake_highscore', next.toString());
          return next;
        });
        state.food = generateFood(newSnake);
        // Slightly speed up
        state.speed = Math.max(65, 110 - newScore * 2);
      } else {
        newSnake.pop();
      }

      state.snake = newSnake;
      draw();
      timerId = setTimeout(tick, state.speed);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const cell = canvas.width / GRID_SIZE;

      // Clear background
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(canvas.width, i * cell);
        ctx.stroke();
      }

      // Draw food (glowing energy capsule / coffee cup)
      const food = gameState.current.food;
      const fx = food.x * cell + cell / 2;
      const fy = food.y * cell + cell / 2;

      ctx.save();
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(fx, fy, cell / 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Inner pulse dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fx, fy, cell / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw snake
      const snake = gameState.current.snake;
      snake.forEach((seg, index) => {
        const isHead = index === 0;
        const x = seg.x * cell;
        const y = seg.y * cell;

        ctx.save();
        if (isHead) {
          ctx.shadowColor = '#7c3aed';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 4);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#ffffff';
          const eyeSize = cell / 5;
          ctx.beginPath();
          ctx.arc(x + cell * 0.35, y + cell * 0.35, eyeSize, 0, Math.PI * 2);
          ctx.arc(x + cell * 0.65, y + cell * 0.35, eyeSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Body gradient blend
          const progress = index / snake.length;
          ctx.fillStyle = progress > 0.5 ? '#06b6d4' : '#7c3aed';
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, cell - 4, cell - 4, 3);
          ctx.fill();
        }
        ctx.restore();
      });
    };

    draw();
    timerId = setTimeout(tick, gameState.current.speed);

    return () => clearTimeout(timerId);
  }, [gameOver, isPaused, generateFood]);

  return (
    <div className="snake-game-container">
      <div className="snake-header">
        <div className="snake-stats">
          <span className="snake-stat-pill">
            SCORE: <strong>{score}</strong>
          </span>
          <span className="snake-stat-pill">
            HIGH: <strong>{highScore}</strong>
          </span>
          <span className="snake-stat-pill status">
            {gameOver ? 'CRASHED' : isPaused ? 'PAUSED' : 'RUNNING'}
          </span>
        </div>
        <button className="snake-exit-btn" onClick={onClose} title="Exit (Esc)">
          ✕ Return to Terminal
        </button>
      </div>

      <div className="snake-canvas-wrapper">
        <canvas ref={canvasRef} width={360} height={360} className="snake-canvas" />

        {gameOver && (
          <div className="snake-overlay">
            <h3 className="snake-game-over-title">SYSTEM COMPROMISED</h3>
            <p className="snake-game-over-desc">You scored {score} points!</p>
            <button className="snake-btn-action" onClick={resetGame}>
              ▶ Play Again (Space)
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="snake-overlay">
            <h3 className="snake-game-over-title">PAUSED</h3>
            <button className="snake-btn-action" onClick={() => setIsPaused(false)}>
              ▶ Resume (Space)
            </button>
          </div>
        )}
      </div>

      {/* On-screen D-Pad for Mobile or Mouse interaction */}
      <div className="snake-controls">
        <div className="dpad-row">
          <button
            className="dpad-btn"
            onClick={() => changeDirection(0, -1)}
            aria-label="Up"
          >
            ▲
          </button>
        </div>
        <div className="dpad-row middle">
          <button
            className="dpad-btn"
            onClick={() => changeDirection(-1, 0)}
            aria-label="Left"
          >
            ◀
          </button>
          <button
            className="dpad-btn pause"
            onClick={() => (gameOver ? resetGame() : setIsPaused((p) => !p))}
            aria-label="Action"
          >
            {gameOver ? '↻' : isPaused ? '▶' : '⏸'}
          </button>
          <button
            className="dpad-btn"
            onClick={() => changeDirection(1, 0)}
            aria-label="Right"
          >
            ▶
          </button>
        </div>
        <div className="dpad-row">
          <button
            className="dpad-btn"
            onClick={() => changeDirection(0, 1)}
            aria-label="Down"
          >
            ▼
          </button>
        </div>
      </div>
      <p className="snake-hint">Use Arrow keys / WASD to move • Space to pause • Esc to exit</p>
    </div>
  );
}
