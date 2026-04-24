import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CCol, 
  CRow, 
  CButton, 
  CForm, 
  CFormLabel, 
  CFormInput, 
  CAlert, 
  CContainer 
} from '@coreui/react';

// Styled Components
const StyledBingoCard = styled(CCard)`
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
  background-color: ${props => props.color === 'light' ? '#fff' : `var(--cui-bg-${props.color})`};
  color: ${props => props.color === 'light' ? '#000' : '#fff'};
`;

const ResponsiveBingoCardWrapper = styled.div`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
`;

const BingoCardContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(${props => props.size}, 1fr);
  grid-template-rows: repeat(${props => props.size}, 1fr);
  gap: 2px;
`;

const AnimatedCell = styled(motion.button)`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  font-size: ${props => `calc(20px / ${Math.sqrt(props.size)} + 0.8vw)`};
  font-weight: bold;
  border: none;
  background: ${props => props.marked ? (props.isGold ? '#FFD700' : '#4ecdc4') : '#fff'};
  color: ${props => props.marked ? '#fff' : '#333'};
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.2) 0%,
      rgba(255,255,255,0) 50%,
      rgba(0,0,0,0.1) 100%
    );
    opacity: ${props => props.marked ? 0.8 : 0.4};
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    
    &:before {
      opacity: 0.6;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const generateBingoCard = (size) => {
  const totalCells = size * size;
  const goldPosition = Math.floor(Math.random() * totalCells);
  const card = [];

  let currentNumber = 1;
  
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      const position = i * size + j;
      row.push({
        number: currentNumber,
        isGold: position === goldPosition,
        marked: false
      });
      currentNumber++;
    }
    card.push(row);
  }
  return card;
};

const WinnerPopup = ({ winner }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        recycle={true}
        numberOfPieces={500}
        gravity={0.3}
        tweenDuration={5000}
        colors={['#ff6b6b', '#4ecdc4', '#fff176', '#64b5f6', '#ba68c8']}
      />
      <motion.div
        initial={{ scale: 0, y: -100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '90vw'
        }}
      >
        <motion.h1
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ marginBottom: '2rem' }}
        >
          🎉 Congratulations! 🎉
        </motion.h1>
        <h2 style={{ color: '#4ecdc4', marginBottom: '2rem' }}>
          {winner.name} found the Gold! 🏆
        </h2>
        <CButton 
          color="primary"
          onClick={() => window.location.reload()}
        >
          Play Again
        </CButton>
      </motion.div>
    </motion.div>
  );
};

const PlayerSetup = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [cardSize, setCardSize] = useState(2);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cardSize < playerCount) {
      setCardSize(playerCount);
    }
  }, [playerCount]);

  const handleAddPlayer = (name) => {
    if (players.length < playerCount) {
      setPlayers([...players, { name }]);
    }
  };

  const startGameWithSetup = () => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const gameCard = generateBingoCard(cardSize);
    onStartGame(shuffledPlayers, cardSize, gameCard);
  };

  return (
    <CCard>
      <CCardHeader>
        <h4>Game Setup</h4>
      </CCardHeader>
      <CCardBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="playerCount">Number of Players (2-8)</CFormLabel>
            <CFormInput
              id="playerCount"
              type="number"
              min="2"
              max="8"
              value={playerCount}
              onChange={(e) => setPlayerCount(Math.min(8, Math.max(2, parseInt(e.target.value) || 2)))}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="cardSize">Card Size ({playerCount}-10)</CFormLabel>
            <CFormInput
              id="cardSize"
              type="number"
              min={playerCount}
              max={10}
              value={cardSize}
              onChange={(e) => setCardSize(Math.min(10, Math.max(playerCount, parseInt(e.target.value) || playerCount)))}
            />
          </div>

          {players.length < playerCount && (
            <div className="mb-3">
              <CFormLabel htmlFor="playerName">Player Name</CFormLabel>
              <div className="d-flex">
                <CFormInput
                  id="playerName"
                  placeholder={`Enter Player ${players.length + 1} name`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleAddPlayer(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <CButton
                  color="primary"
                  className="ms-2"
                  onClick={() => {
                    const input = document.getElementById('playerName');
                    if (input.value) {
                      handleAddPlayer(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add Player
                </CButton>
              </div>
            </div>
          )}

          {players.length > 0 && (
            <div>
              <h5 className="mb-2">Players Turn Order:</h5>
              <CCard className="overflow-auto" style={{ maxHeight: '200px' }}>
                <CCardBody>
                  <ol className="list-group list-group-numbered">
                    {players.map((player, index) => (
                      <li key={index} className="list-group-item">
                        {player.name}
                      </li>
                    ))}
                  </ol>
                </CCardBody>
              </CCard>
            </div>
          )}

          {players.length === playerCount && (
            <CButton
              color="success"
              className="mt-3"
              onClick={startGameWithSetup}
            >
              Start Game
            </CButton>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  );
};

const BingoCard = ({ card, isCurrentPlayer, onCellClick, playerName }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 1 }}
    >
      <StyledBingoCard color="light" className={`mb-0 ${isCurrentPlayer ? 'border-primary border-3' : ''}`}>
        <CCardHeader className="text-center py-2">
          <motion.h5 
            className="mb-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {playerName}'s Card
          </motion.h5>
        </CCardHeader>
        <CCardBody className="p-2">
          <ResponsiveBingoCardWrapper>
            <BingoCardContent size={card.length}>
              {card.flat().map((cell, index) => (
                <motion.div
                  key={index}
                  initial={{ 
                    scale: 0,
                    rotate: -180,
                    opacity: 0
                  }}
                  animate={{ 
                    scale: 1,
                    rotate: 0,
                    opacity: 1
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.05, // Stagger effect
                    duration: 0.8
                  }}
                >
                  <AnimatedCell
                    onClick={() => isCurrentPlayer && !cell.marked && onCellClick(index)}
                    whileHover={isCurrentPlayer && !cell.marked ? { 
                      scale: 1.1,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      transition: { duration: 0.2 }
                    } : {}}
                    whileTap={isCurrentPlayer && !cell.marked ? { 
                      scale: 0.95,
                      rotate: -10
                    } : {}}
                    animate={{
                      backgroundColor: cell.marked 
                        ? (cell.isGold ? '#FFD700' : '#4ecdc4') 
                        : '#fff',
                      scale: cell.marked ? [1, 1.2, 1] : 1,
                      rotate: cell.marked ? [0, 360, 0] : 0,
                    }}
                    transition={{
                      duration: 0.6,
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                    disabled={cell.marked || !isCurrentPlayer}
                    size={card.length}
                    marked={cell.marked}
                    isGold={cell.isGold}
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.5 }}
                    >
                      {cell.marked ? (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, type: "spring" }}
                        >
                          {cell.isGold ? '🏆' : '❌'}
                        </motion.span>
                      ) : (
                        <motion.span
                          whileHover={{ scale: 1.2 }}
                          style={{ display: 'inline-block' }}
                        >
                          {cell.number}
                        </motion.span>
                      )}
                    </motion.span>
                  </AnimatedCell>
                </motion.div>
              ))}
            </BingoCardContent>
          </ResponsiveBingoCardWrapper>
        </CCardBody>
      </StyledBingoCard>
    </motion.div>
  );
};

const GoldDiggerGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [winner, setWinner] = useState(null);
  const [gameCard, setGameCard] = useState(null);

  const startGame = (setupPlayers, size, initialGameCard) => {
    setPlayers(setupPlayers);
    setGameCard(initialGameCard);
    setCurrentPlayerIndex(0);
    setGameState('playing');
  };

  const handleCellClick = (cellIndex) => {
    if (gameState !== 'playing') return;

    const flatCard = gameCard.flat();
    const cell = flatCard[cellIndex];

    if (cell.marked) return;

    const updatedCard = gameCard.map(row =>
      row.map(c => c === cell ? { ...c, marked: true } : c)
    );

    setGameCard(updatedCard);

    if (cell.isGold) {
      setWinner(players[currentPlayerIndex]);
      setGameState('winner');
    } else {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }
  };

  return (
    <CContainer fluid>
      {gameState === 'setup' && (
        <PlayerSetup onStartGame={startGame} />
      )}

      {gameState === 'playing' && gameCard && (
        <>
          <div className="bg-light p-4 mb-4 rounded">
            <h2 className="text-center">
              Current Turn: {players[currentPlayerIndex].name}
            </h2>
          </div>

          <div className="d-flex justify-content-center">
            <div style={{ maxWidth: '600px', width: '100%' }}>
              <BingoCard
                card={gameCard}
                isCurrentPlayer={true}
                onCellClick={handleCellClick}
                playerName="Gold Digger"
              />
            </div>
          </div>

          <div className="mt-4">
            <h5 className="text-center mb-3">Players Turn Order:</h5>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              {players.map((player, index) => (
                <div
                  key={index}
                  className={`badge ${index === currentPlayerIndex ? 'bg-primary' : 'bg-secondary'} p-2`}
                  style={{ fontSize: '1rem' }}
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {gameState === 'winner' && winner && (
        <WinnerPopup winner={winner} />
      )}
    </CContainer>
  );
};

export default GoldDiggerGame;