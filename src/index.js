// Qui andrà il codice completo del gioco Snake
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const SnakeGame = () => {
  // Configurazioni di gioco
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const CELL_SIZE = 20;
  const GAME_SPEED = 10;

  // Stato del gioco
  const [gameState, setGameState] = useState({
    snake: [[200, 200]],
    food: [0, 0],
    direction: [20, 0],
    score: 0,
    gameOver: false
  });

  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  // Genera cibo in posizione casuale
  const generateFood = (snake) => {
    while (true) {
      const foodX = Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE)) * CELL_SIZE;
      const foodY = Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE)) * CELL_SIZE;
      
      // Assicura che il cibo non cada sopra il serpente
      const foodOnSnake = snake.some(
        segment => segment[0] === foodX && segment[1] === foodY
      );
      
      if (!foodOnSnake) return [foodX, foodY];
    }
  };

  // Inizializza il gioco
  const initGame = () => {
    const initialFood = generateFood([[200, 200]]);
    setGameState({
      snake: [[200, 200]],
      food: initialFood,
      direction: [20, 0],
      score: 0,
      gameOver: false
    });
  };

  // Logica di movimento del serpente
  const moveSnake = () => {
    const { snake, food, direction } = gameState;
    const newHead = [
      snake[snake.length - 1][0] + direction[0], 
      snake[snake.length - 1][1] + direction[1]
    ];

    // Controllo collisione con bordi
    if (
      newHead[0] < 0 || newHead[0] >= CANVAS_WIDTH ||
      newHead[1] < 0 || newHead[1] >= CANVAS_HEIGHT
    ) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      return;
    }

    // Controllo auto-collisione
    const selfCollision = snake.some(
      segment => segment[0] === newHead[0] && segment[1] === newHead[1]
    );
    if (selfCollision) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      return;
    }

    const newSnake = [...snake, newHead];

    // Controllo mangiare cibo
    const ateFood = newHead[0] === food[0] && newHead[1] === food[1];
    if (ateFood) {
      const newFood = generateFood(newSnake);
      setGameState(prev => ({
        ...prev,
        snake: newSnake,
        food: newFood,
        score: prev.score + 1
      }));
    } else {
      // Rimuovi la coda se non mangia
      newSnake.shift();
      setGameState(prev => ({ ...prev, snake: newSnake }));
    }
  };

  // Disegna il gioco
  const drawGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Pulisci canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Disegna serpente con gradiente
    gameState.snake.forEach((segment, index) => {
      const percentage = index / gameState.snake.length;
      const r = Math.floor(0 * (1 - percentage) + 100 * percentage);
      const g = Math.floor(100 * (1 - percentage) + 255 * percentage);
      const b = Math.floor(0 * (1 - percentage) + 100 * percentage);
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(segment[0], segment[1], CELL_SIZE, CELL_SIZE);
    });

    // Disegna cibo
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.ellipse(
      gameState.food[0] + CELL_SIZE/2, 
      gameState.food[1] + CELL_SIZE/2, 
      CELL_SIZE/2, 
      CELL_SIZE/2, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();

    // Mostra punteggio
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Punteggio: ${gameState.score}`, 10, 30);
  };

  // Game loop
  useEffect(() => {
    if (gameState.gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawGame();
    
    // Implementa game loop
    gameLoopRef.current = setInterval(moveSnake, 1000 / GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState]);

  // Gestione input da tastiera
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState.gameOver) {
        if (e.key === 'r' || e.key === 'R') {
          initGame();
        }
        return;
      }

      switch(e.key) {
        case 'ArrowUp':
          if (gameState.direction[1] === 0) 
            setGameState(prev => ({ ...prev, direction: [0, -CELL_SIZE] }));
          break;
        case 'ArrowDown':
          if (gameState.direction[1] === 0) 
            setGameState(prev => ({ ...prev, direction: [0, CELL_SIZE] }));
          break;
        case 'ArrowLeft':
          if (gameState.direction[0] === 0) 
            setGameState(prev => ({ ...prev, direction: [-CELL_SIZE, 0] }));
          break;
        case 'ArrowRight':
          if (gameState.direction[0] === 0) 
            setGameState(prev => ({ ...prev, direction: [CELL_SIZE, 0] }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  // Movimento con bottoni touch
  const moveWithButton = (newDirection) => {
    if (gameState.gameOver) {
      initGame();
      return;
    }

    const { direction } = gameState;
    switch(newDirection) {
      case 'UP':
        if (direction[1] === 0) 
          setGameState(prev => ({ ...prev, direction: [0, -CELL_SIZE] }));
        break;
      case 'DOWN':
        if (direction[1] === 0) 
          setGameState(prev => ({ ...prev, direction: [0, CELL_SIZE] }));
        break;
      case 'LEFT':
        if (direction[0] === 0) 
          setGameState(prev => ({ ...prev, direction: [-CELL_SIZE, 0] }));
        break;
      case 'RIGHT':
        if (direction[0] === 0) 
          setGameState(prev => ({ ...prev, direction: [CELL_SIZE, 0] }));
        break;
    }
  };

  // Inizializza il gioco al primo rendering
  useEffect(() => {
    initGame();
  }, []);

  return React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4" },
    React.createElement('h1', { className: "text-2xl text-white mb-4" }, "Snake Game"),
    
    // Canvas di gioco
    React.createElement('canvas', { 
      ref: canvasRef, 
      width: CANVAS_WIDTH, 
      height: CANVAS_HEIGHT,
      className: "border-2 border-white mb-4"
    }),

    // Game Over Overlay
    gameState.gameOver && React.createElement('div', { className: "absolute text-center" },
      React.createElement('h2', { className: "text-red-500 text-3xl mb-4" }, "Game Over!"),
      React.createElement('p', { className: "text-white mb-2" }, `Punteggio finale: ${gameState.score}`),
      React.createElement('p', { className: "text-white" }, "Premi 'R' per ricominciare")
    ),

    // Controlli touch per mobile
    React.createElement('div', { className: "grid grid-cols-3 gap-2 mt-4" },
      React.createElement('div', { className: "col-start-2" },
        React.createElement('button', { 
          onClick: () => moveWithButton('UP'),
          className: "w-16 h-16 bg-blue-500 text-white rounded flex items-center justify-center"
        }, '↑')
      ),
      React.createElement('div', { className: "col-start-1 row-start-2" },
        React.createElement('button', { 
          onClick: () => moveWithButton('LEFT'),
          className: "w-16 h-16 bg-blue-500 text-white rounded flex items-center justify-center"
        }, '←')
      ),
      React.createElement('div', { className: "col-start-2 row-start-2" },
        React.createElement('button', { 
          onClick: () => moveWithButton('DOWN'),
          className: "w-16 h-16 bg-blue-500 text-white rounded flex items-center justify-center"
        }, '↓')
      ),
      React.createElement('div', { className: "col-start-3 row-start-2" },
        React.createElement('button', { 
          onClick: () => moveWithButton('RIGHT'),
          className: "w-16 h-16 bg-blue-500 text-white rounded flex items-center justify-center"
        }, '→')
      )
    )
  );
};

ReactDOM.render(React.createElement(SnakeGame), document.getElementById('root'));
