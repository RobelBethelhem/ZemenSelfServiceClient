import React, { useState, useEffect, useRef } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CAlert,
} from '@coreui/react';

const generateBingoCard = (size, globalNumberPool) => {
  const card = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      // Ensure unique numbers across all players by drawing from the global pool
      const availableNumbers = globalNumberPool[j].filter(
        (num) => !card.flat().some((cell) => cell.number === num)
      );
      if (availableNumbers.length === 0) {
        console.warn(`No available numbers left for column ${j + 1}`);
        break;
      }
      const number =
        availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      // Remove the selected number from the global pool to ensure uniqueness across all players
      globalNumberPool[j] = globalNumberPool[j].filter((num) => num !== number);
      row.push({
        number: number,
        marked: false,
      });
    }
    card.push(row);
  }
  return card;
};

const PlayerSetup = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [cardSize, setCardSize] = useState(5);
  const [players, setPlayers] = useState([
    { name: 'Player 1', color: 'primary' },
    { name: 'Player 2', color: 'danger' },
  ]);

  const colors = ['primary', 'danger', 'success', 'warning', 'info', 'dark'];

  const handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value) || 2;
    setPlayerCount(Math.min(Math.max(count, 2), 100));

    const newPlayers = Array(count)
      .fill(null)
      .map((_, i) => ({
        name: `Player ${i + 1}`,
        color: colors[i % colors.length],
      }));
    setPlayers(newPlayers);
  };

  const handleCardSizeChange = (e) => {
    const size = parseInt(e.target.value) || 5;
    setCardSize(Math.min(Math.max(size, 2), 10));
  };

  const handleStartGame = () => {
    // Initialize global number pool per column
    const globalNumberPool = Array(cardSize)
      .fill(null)
      .map((_, j) => {
        const min = j * Math.floor(100 / cardSize) + 1;
        const max = (j + 1) * Math.floor(100 / cardSize);
        return Array.from({ length: max - min + 1 }, (_, i) => min + i);
      });

    const playersWithCards = players.map((player) => ({
      ...player,
      card: generateBingoCard(cardSize, globalNumberPool),
    }));
    onStartGame(playersWithCards, cardSize);
  };

  return (
    <CCard className="mx-auto mt-4" style={{ maxWidth: '500px' }}>
      <CCardHeader>
        <h4>Player Setup</h4>
      </CCardHeader>
      <CCardBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="playerCount">Number of Players (2-100)</CFormLabel>
            <CFormInput
              id="playerCount"
              type="number"
              min="2"
              max="100"
              value={playerCount}
              onChange={handlePlayerCountChange}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="cardSize">Card Size (2-10)</CFormLabel>
            <CFormInput
              id="cardSize"
              type="number"
              min="2"
              max="10"
              value={cardSize}
              onChange={handleCardSizeChange}
            />
          </div>
          <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {players.map((player, index) => (
              <div key={index} className="mb-2">
                <CFormLabel htmlFor={`player${index}`}>Player {index + 1} Name</CFormLabel>
                <CFormInput
                  id={`player${index}`}
                  value={player.name}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    newPlayers[index].name = e.target.value;
                    setPlayers(newPlayers);
                  }}
                />
              </div>
            ))}
          </div>
          <CButton color="primary" onClick={handleStartGame} className="w-100">
            Start Game
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

const BingoCard = ({ card, color, onCellClick, timer }) => {
  const size = card.length;

  return (
    <div className={`position-relative bingo-card p-2`}>
      {timer > 0 && (
        <div
          className="timer-badge"
          style={{
            transform: 'translate(50%, -50%)',
            zIndex: 1,
          }}
        >
          {timer}
        </div>
      )}

      {/* Column Headers */}
      <div className="d-flex mb-1 bingo-header">
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="flex-grow-1">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Bingo Grid */}
      <div className="bingo-grid">
        {card.map((row, i) => (
          <div key={i} className="d-flex" style={{ gap: '2px', marginBottom: '2px' }}>
            {row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => onCellClick(i, j)}
                className={`
                  bingo-cell 
                  d-flex 
                  align-items-center 
                  justify-content-center 
                  flex-grow-1
                  ${cell.marked ? `bg-${color}` : 'bg-light'}
                  ${timer > 0 && cell.number === 'FREE' ? 'cursor-pointer' : ''}
                `}
                style={{
                  aspectRatio: '1',
                  fontSize: `calc(10px + ${14 / size}px)`,
                  fontWeight: 'bold',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  userSelect: 'none',
                }}
              >
                {cell.number}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const checkWin = (card) => {
  const size = card.length;
  // Check rows and columns
  for (let i = 0; i < size; i++) {
    if (card[i].every((cell) => cell.marked)) return true;
    if (card.every((row) => row[i].marked)) return true;
  }
  // Check diagonals
  if (card.every((row, i) => row[i].marked)) return true;
  if (card.every((row, i) => row[size - 1 - i].marked)) return true;
  return false;
};

// Countdown Timer Component
const CountdownTimer = ({ seconds }) => (
  <div className="countdown-timer">
    <div className="countdown-value">{seconds}</div>
    <div className="countdown-label">Next Draw</div>
  </div>
);

// Number Draw Component
const NumberDraw = ({ number, isDrawing, nextDrawSeconds }) => {
  return (
    <div className="draw-section">
      <div className="number-draw-container">
        <div className={`number-display ${isDrawing ? 'drawing' : ''}`}>
          {isDrawing ? (
            <div className="rolling-numbers">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="rolling-number">
                  {Math.floor(Math.random() * 100)}
                </div>
              ))}
            </div>
          ) : (
            <div className="final-number">
              <span className="number-value">{number || '??'}</span>
            </div>
          )}
        </div>
        {!isDrawing && number && (
          <div className="called-label">Last Called Number</div>
        )}
      </div>
      {!isDrawing && nextDrawSeconds > 0 && (
        <CountdownTimer seconds={nextDrawSeconds} />
      )}
    </div>
  );
};

const BingoGame = () => {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'finished'
  const [players, setPlayers] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [lastCalledNumber, setLastCalledNumber] = useState(null);
  const [winners, setWinners] = useState([]);
  const [showError, setShowError] = useState(false);
  const [cardSize, setCardSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [nextDrawSeconds, setNextDrawSeconds] = useState(10);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [timer, setTimer] = useState(0);
  const drawTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const synth = useRef(window.speechSynthesis);

  const startGame = (setupPlayers, size) => {
    setPlayers(setupPlayers);
    setCardSize(size);
    setGameState('playing');

    // Initialize availableNumbers as a unique set of all numbers across all players' cards
    const allNumbers = setupPlayers.flatMap((player) =>
      player.card.flat().map((cell) => cell.number)
    );
    const uniqueNumbers = Array.from(new Set(allNumbers));
    setAvailableNumbers(uniqueNumbers);
  };

  const announceNumber = (number) => {
    const utterance = new SpeechSynthesisUtterance(`Number ${number}`);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    synth.current.speak(utterance);
  };

  const performNumberDraw = async () => {
    if (availableNumbers.length === 0 || isDrawing) return;

    setIsDrawing(true);

    // Simulate drawing animation for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Draw a random number from availableNumbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const newNumber = availableNumbers[randomIndex];

    // Update state
    setCalledNumbers((prev) => [...prev, newNumber]);
    setLastCalledNumber(newNumber);
    setIsDrawing(false);
    setAvailableNumbers((prev) => prev.filter((num) => num !== newNumber));

    // Announce the number
    announceNumber(newNumber);

    // Start universal selection phase
    setTimer(10); // 10 seconds for all players
  };

  // Start automatic drawing when game starts or after a draw completes
  useEffect(() => {
    if (gameState === 'playing' && availableNumbers.length > 0 && !isDrawing && timer === 0) {
      performNumberDraw();
    }
    return () => {
      if (drawTimeoutRef.current) {
        clearTimeout(drawTimeoutRef.current);
        drawTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, availableNumbers, isDrawing, timer]);

  // Handle universal countdown timer
  useEffect(() => {
    if (timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && gameState === 'playing' && !isDrawing) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      // Next number will be drawn automatically by the above useEffect
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timer, gameState, isDrawing]);

  const handleCellClick = (playerIndex, rowIndex, colIndex) => {
    if (timer <= 0 || gameState !== 'playing') return;

    const cell = players[playerIndex].card[rowIndex][colIndex];
    if (cell.number === lastCalledNumber && !cell.marked) {
      const updatedPlayers = [...players];
      updatedPlayers[playerIndex].card[rowIndex][colIndex].marked = true;
      setPlayers(updatedPlayers);
    }
  };

  const handleBingoClaim = (playerIndex) => {
    const playerCard = players[playerIndex].card;
    if (!checkWin(playerCard)) {
      const markedCells = [];
      playerCard.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.marked && cell.number !== 'FREE') {
            markedCells.push([i, j]);
          }
        });
      });

      if (markedCells.length > 0) {
        const [i, j] =
          markedCells[Math.floor(Math.random() * markedCells.length)];
        const updatedPlayers = [...players];
        updatedPlayers[playerIndex].card[i][j].marked = false;
        setPlayers(updatedPlayers);
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } else {
      setWinners((prev) => [...prev, players[playerIndex]]);
      setGameState('finished');
    }
  };

  if (gameState === 'setup') {
    return <PlayerSetup onStartGame={startGame} />;
  }

  return (
    <CContainer fluid className="py-4">
      <CCard className="mb-4">
        <CCardHeader>
          <h4>Bingo Game</h4>
        </CCardHeader>
        <CCardBody>
          <NumberDraw
            number={lastCalledNumber}
            isDrawing={isDrawing}
            nextDrawSeconds={timer}
          />
          {showError && (
            <CAlert color="danger" className="mt-3 text-center">
              Invalid Bingo claim! A number has been unmarked as penalty.
            </CAlert>
          )}
        </CCardBody>
      </CCard>

      <CRow>
        {players.map((player, index) => (
          <CCol key={index} xs={12} md={6} xl={4} className="mb-4">
            <CCard>
              <CCardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{player.name}</h5>
                  <CButton
                    onClick={() => handleBingoClaim(index)}
                    disabled={
                      winners.includes(player) || gameState === 'finished'
                    }
                    color={winners.includes(player) ? 'success' : 'danger'}
                  >
                    {winners.includes(player) ? 'Winner!' : 'BINGO!'}
                  </CButton>
                </div>
              </CCardHeader>
              <CCardBody>
                <BingoCard
                  card={player.card}
                  color={player.color}
                  onCellClick={(i, j) => handleCellClick(index, i, j)}
                  timer={timer}
                />
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </CContainer>
  );
};

export default BingoGame;