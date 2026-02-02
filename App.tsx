import React, { useState } from 'react';
import Game from './components/Game';
import UI from './components/UI';
import Player from './components/Player';
import Monster from './components/Monster';
import Sounds from './components/Sounds';
import { GameState, Difficulty } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [booksCollected, setBooksCollected] = useState(0);
  const [keysCollected, setKeysCollected] = useState(0);
  const [health, setHealth] = useState(100);

  // Transition from Menu to Level Select
  const handleOpenLevels = () => {
    setGameState(GameState.LEVEL_SELECT);
  };

  // Back from Level Select to Menu
  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
  };

  // Level Selected -> Go to Difficulty Select
  const handleLevelSelect = (level: number) => {
    console.log(`Selected Level ${level}`);
    // Future: Set map based on level
    setGameState(GameState.DIFFICULTY_SELECT);
  };

  // Back from Difficulty to Levels
  const handleBackToLevels = () => {
    setGameState(GameState.LEVEL_SELECT);
  };

  // Difficulty Selected -> Start Game
  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameState(GameState.PLAYING);
    setHealth(100);
    setBooksCollected(0);
    setKeysCollected(0);
  };

  const handleRestart = () => {
    setGameState(GameState.MENU);
    setHealth(100);
    setBooksCollected(0);
    setKeysCollected(0);
    // Removed window.location.reload() to prevent crashes and enable smooth state reset
  };

  const handleResume = () => {
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Game 
        gameState={gameState}
        setGameState={setGameState}
        onGameOver={() => setGameState(GameState.GAME_OVER)}
        onVictory={() => setGameState(GameState.VICTORY)}
        setBooksCollected={setBooksCollected}
        setKeysCollected={setKeysCollected}
        setHealth={setHealth}
        difficulty={difficulty}
      />
      <Player gameState={gameState} health={health} />
      <Monster gameState={gameState} />
      <Sounds 
        gameState={gameState} 
        books={booksCollected} 
        keys={keysCollected}
        health={health}
      />
      <UI 
        gameState={gameState}
        books={booksCollected}
        keys={keysCollected}
        health={health}
        onStart={handleOpenLevels} 
        onSelectLevel={handleLevelSelect}
        onSelectDifficulty={handleDifficultySelect}
        onBackToMenu={handleBackToMenu}
        onBackToLevels={handleBackToLevels}
        onRestart={handleRestart}
        onResume={handleResume}
      />
    </div>
  );
};

export default App;