import React, { useState, useEffect } from 'react';
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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CContainer
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilVolumeHigh, cilUserPlus } from "@coreui/icons";
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeVoices, speakText } from './voiceConfig';
import Confetti from 'react-confetti'; 
// Add these constants at the top of your file after the imports
const VOICE_LANGUAGES = {
  English: { code: 'en-US', label: 'English' },
  Amharic: { code: 'am-ET', label: 'አማርኛ' },
  Tigrinya: { code: 'ti-ET', label: 'ትግርኛ' },
  Oromiffa: { code: 'om-ET', label: 'Afaan Oromoo' }
};

const BINGO_RANGES = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75]
};

const COLUMNS = ['B', 'I', 'N', 'G', 'O'];

// Update the generateBingoCard function
const generateBingoCard = () => {
  const size = 5;
  const card = [];
  const usedNumbers = new Set();

  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      if (i === 2 && j === 2) {
        row.push({ number: 'FREE', marked: true, column: 'N' });
      } else {
        const column = COLUMNS[j];
        const [min, max] = BINGO_RANGES[column];
        let number;
        do {
          number = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (usedNumbers.has(number));
        
        usedNumbers.add(number);
        row.push({ number, marked: false, column });
      }
    }
    card.push(row);
  }
  return card;
};

// Add new helper function for generating called numbers
const generateCalledNumber = (calledNumbers) => {
  const availableColumns = COLUMNS.filter(column => {
    const [min, max] = BINGO_RANGES[column];
    const numbersInRange = calledNumbers.filter(num => 
      num.number >= min && num.number <= max
    );
    return numbersInRange.length < (column === 'N' ? 14 : 15); // Account for FREE space
  });

  if (availableColumns.length === 0) return null;

  const column = availableColumns[Math.floor(Math.random() * availableColumns.length)];
  const [min, max] = BINGO_RANGES[column];
  let number;
  
  do {
    number = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (calledNumbers.some(called => called.number === number));

  return { column, number };
};

// Update getAnnouncementText function with proper translations
const getAnnouncementText = (column, number, language) => {
  const translateNumber = (num) => {
    if (language === 'Amharic') {
      const amharicNumbers = ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱', '፲'];
      const digits = num.toString().split('');
      return digits.map(digit => 
        amharicNumbers[parseInt(digit) - 1] || digit
      ).join('');
    }
    return num.toString();
  };

  const getColumnName = (col, lang) => {
    switch (lang) {
      case 'Amharic':
        return {
          'B': 'ቢ',
          'I': 'አይ',
          'N': 'ኤን',
          'G': 'ጂ',
          'O': 'ኦ'
        }[col];
      case 'Tigrinya':
        return {
          'B': 'ቢ',
          'I': 'አይ',
          'N': 'ኤን',
          'G': 'ጂ',
          'O': 'ኦ'
        }[col];
      default:
        return col;
    }
  };

  const translatedColumn = getColumnName(column, language);
  const translatedNumber = translateNumber(number);
  
  return `${translatedColumn} ${translatedNumber}`;
};

// Update speak function to use ResponsiveVoice
const speak = async (text, language = 'English') => {
  try {
    await speakText(text, language);
  } catch (error) {
    console.error('Speech error:', error);
  }
};

// Add this styled component for the 3D card effect
const StyledBingoCard = styled(CCard)`
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  transition: all 0.3s ease;
  border: none;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  transform-style: preserve-3d;
  perspective: 1000px;

  &:hover {
    transform: scale(1.05) rotateX(5deg) rotateY(5deg);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
`;

// Define StyledBingoCardFirst with a unique gradient
const StyledBingoCardFirst = styled(StyledBingoCard)`
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
`;

// Add this new styled component
const ResponsiveBingoCardWrapper = styled.div`
  width: 100%;
  padding-bottom: 100%; /* Maintains square aspect ratio */
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding-bottom: 100%;
  }
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




// Add these new styled components after your existing styled components
const BingoHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  margin-bottom: 4px;
`;

const HeaderCell = styled.div`
  background: #4ecdc4;
  color: white;
  font-weight: bold;
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
`;

const DrawCounter = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  z-index: 1000;
`;

const BingoCard = ({ card, color, isCurrentPlayer, isFirst }) => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", duration: 1 }}
  >
    {isFirst ? (
      <StyledBingoCardFirst className={`mb-0 ${isCurrentPlayer ? 'border-warning border-3' : ''}`}>
        <CCardBody className="p-2">
          {/* Add BINGO header */}
          <BingoHeader>
            {COLUMNS.map((letter, index) => (
              <HeaderCell key={index}>
                {letter}
              </HeaderCell>
            ))}
          </BingoHeader>
          
          <ResponsiveBingoCardWrapper>
            <BingoCardContent size={card.length}>
              {card.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    initial={{ scale: 0, rotate: -360 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring",
                      delay: (rowIndex * 5 + colIndex) * 0.05,
                      duration: 0.5
                    }}
                  >
                    <AnimatedCell
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        backgroundColor: cell.marked ? '#a1c4fd' : '#fff',
                        scale: cell.marked ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      disabled={cell.marked}
                      size={card.length}
                      marked={cell.marked}
                      isFree={cell.number === 'FREE'}
                    >
                      <div className="cell-content">
                        {cell.number}
                        {cell.marked && (
                          <motion.div
                            className="dauber"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </div>
                    </AnimatedCell>
                  </motion.div>
                ))
              ))}
            </BingoCardContent>
          </ResponsiveBingoCardWrapper>
        </CCardBody>
      </StyledBingoCardFirst>
    ) : (
      <StyledBingoCard color={color} className={`mb-0 ${isCurrentPlayer ? 'border-primary border-3' : ''}`}>
        <CCardBody className="p-2">
          {/* Add BINGO header */}
          <BingoHeader>
            {COLUMNS.map((letter, index) => (
              <HeaderCell key={index}>
                {letter}
              </HeaderCell>
            ))}
          </BingoHeader>
          
          <ResponsiveBingoCardWrapper>
            <BingoCardContent size={card.length}>
              {card.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    initial={{ scale: 0, rotate: -360 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: (rowIndex * 5 + colIndex) * 0.05, duration: 0.5 }}
                  >
                    <AnimatedCell
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        backgroundColor: cell.marked ? '#a1c4fd' : '#fff',
                        scale: cell.marked ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      disabled={cell.marked}
                      size={card.length}
                      marked={cell.marked}
                      isFree={cell.number === 'FREE'}
                    >
                      <div className="cell-content">
                        {cell.number}
                        {cell.marked && (
                          <motion.div
                            className="dauber"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </div>
                    </AnimatedCell>
                  </motion.div>
                ))
              ))}
            </BingoCardContent>
          </ResponsiveBingoCardWrapper>
        </CCardBody>
      </StyledBingoCard>
    )}
  </motion.div>
);

// Update the AnimatedCell styled component
const AnimatedCell = styled(motion.button)`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  font-size: ${props => props.isFree ? 'calc(12px + 0.3vw)' : 'calc(16px + 0.5vw)'};
  font-weight: bold;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: ${props => {
    if (props.isFree) return 'linear-gradient(135deg, #4ecdc4, #2cb5ab)';
    return props.marked ? '#4ecdc4' : '#fff';
  }};
  color: ${props => (props.marked || props.isFree) ? '#fff' : '#333'};
  box-shadow: ${props => props.marked ? '0 4px 8px rgba(78, 205, 196, 0.3)' : '0 4px 8px rgba(0,0,0,0.1)'};
  cursor: ${props => props.marked ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: ${props => props.marked ? 'none' : 'scale(1.1)'};
    box-shadow: ${props => props.marked ? '0 4px 8px rgba(78, 205, 196, 0.3)' : '0 6px 12px rgba(0,0,0,0.2)'};
  }

  .cell-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .dauber {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    pointer-events: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
    z-index: 1;
  }
`;

// Add new styled component for the cell background pattern
const CellBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(circle at center, #000 1px, transparent 1px);
  background-size: 10px 10px;
  pointer-events: none;
`;

const PlayerSetup = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [drawLimit, setDrawLimit] = useState(10);
  const [players, setPlayers] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleAddPlayer = (name, index) => {
    if (players.length < playerCount) {
      const colors = ['light', 'info', 'warning', 'danger', 'primary', 'secondary', 'success', 'dark'];
      const playerColor = index === 0 ? 'warning' : colors[(players.length - (index === 0 ? 1 : 0)) % colors.length];
      setPlayers([...players, {
        name,
        card: generateBingoCard(),
        color: playerColor
      }]);
    }
  };

  return (
    <CCard>
      <CCardHeader>
        <h4>Game Setup</h4>
      </CCardHeader>
      <CCardBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="language">Voice Language</CFormLabel>
            <select
              className="form-select"
              id="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {Object.entries(VOICE_LANGUAGES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="playerCount">Number of Players (2-100)</CFormLabel>
            <CFormInput
              id="playerCount"
              type="number"
              min="2"
              max="100"
              value={playerCount}
              onChange={(e) => setPlayerCount(Math.min(100, Math.max(2, parseInt(e.target.value) || 2)))}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="drawLimit">Number of Draws (10-100)</CFormLabel>
            <CFormInput
              id="drawLimit"
              type="number"
              min="10"
              max="100"
              value={drawLimit}
              onChange={(e) => setDrawLimit(Math.min(100, Math.max(10, parseInt(e.target.value) || 10)))}
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
                      handleAddPlayer(e.target.value, players.length);
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
                      handleAddPlayer(input.value, players.length);
                      input.value = '';
                    }
                  }}
                >
                  <CIcon icon={cilUserPlus} className="me-2" />
                  Add Player
                </CButton>
              </div>
            </div>
          )}
          {players.length > 0 && (
            <div>
              <h5 className="mb-2">Added Players:</h5>
              <CCard className="overflow-auto" style={{ maxHeight: '200px' }}>
                <CCardBody>
                  <ul className="list-unstyled">
                    {players.map((player, index) => (
                      <li key={index}>{player.name}</li>
                    ))}
                  </ul>
                </CCardBody>
              </CCard>
            </div>
          )}

          {players.length === playerCount && (
            <CButton
              color="success"
              className="mt-3"
              onClick={() => onStartGame(players, selectedLanguage, drawLimit)}
            >
              Start Game
            </CButton>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  );
};

// Add new styled component for winner animation
const WinnerOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const WinnerCard = styled(motion.div)`
  background: linear-gradient(145deg, #f3ec78, #af4261);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  max-width: 90vw;
  width: 600px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
`;

// Add these styled components for the number animation
const NumberContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
`;

const NumberBall = styled(motion.div)`
  background: linear-gradient(135deg, #ff6b6b, #ff8787);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

// Add these styled components for lottery animation
const LotteryContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 2rem auto;
  perspective: 1000px;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

const LotteryMachine = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  overflow: hidden;
  border: 4px solid rgba(255,255,255,0.2);
`;

const RotatingBallsContainer = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LotteryBall = styled(motion.div)`
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: inset -2px -2px 8px rgba(0,0,0,0.1);
  color: #2c3e50;
`;

const DrawnBall = styled(motion.div)`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ff8787);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 8px 32px rgba(255,107,107,0.4);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  z-index: 10;
`;

// Update CallNumberAnimation component
const CallNumberAnimation = ({ number, column }) => {
  const [isDrawing, setIsDrawing] = useState(true);
  const ballCount = 15; // Number of rotating balls

  // Generate positions for rotating balls
  const balls = Array.from({ length: ballCount }, (_, i) => ({
    id: i,
    number: Math.floor(Math.random() * 25) + 1,
    radius: 80, // Radius of rotation
    angle: (360 / ballCount) * i, // Initial angle
  }));

  useEffect(() => {
    setIsDrawing(true);
    const timer = setTimeout(() => {
      setIsDrawing(false);
    }, 2000); // Show rotating balls for 2 seconds

    return () => clearTimeout(timer);
  }, [number]); // Trigger effect when number changes

  return (
    <LotteryContainer>
      <LotteryMachine>
        <AnimatePresence>
          {isDrawing ? (
            <RotatingBallsContainer
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {balls.map((ball) => (
                <LotteryBall
                  key={ball.id}
                  initial={{
                    x: Math.cos(ball.angle * (Math.PI / 180)) * ball.radius,
                    y: Math.sin(ball.angle * (Math.PI / 180)) * ball.radius,
                  }}
                >
                  {ball.number}
                </LotteryBall>
              ))}
            </RotatingBallsContainer>
          ) : (
            <DrawnBall
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                transition: {
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                }
              }}
              whileHover={{
                scale: 1.1,
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.5 }
              }}
            >
              <div className="text-center">
                <div className="column-letter">{column}</div>
                <div className="number">{number}</div>
              </div>
            </DrawnBall>
          )}
        </AnimatePresence>

        {/* Add light reflection effect */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      </LotteryMachine>
    </LotteryContainer>
  );
};

// Update WinnerPopup component
const WinnerPopup = ({ winners }) => {
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
    <WinnerOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
      <WinnerCard
        initial={{ scale: 0, y: -1000 }}
        animate={{ 
          scale: 1, 
          y: 0,
          transition: {
            type: "spring",
            damping: 15,
            stiffness: 100
          }
        }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <h1 className="display-1 mb-4" style={{ color: '#ffffff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>🎉 BINGO! 🎉</h1>
        </motion.div>
        
        {winners.map((winner, index) => (
          <motion.div key={index} className="mb-4">
            <motion.h2 
              className="display-4 mb-4"
              style={{ color: '#ffe066', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
              animate={{ 
                color: ['#ffe066', '#ffdd57', '#ffe066'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {winner.name} Wins!
            </motion.h2>
            <BingoCard 
              card={winner.card} 
              color={winner.color}
              isFirst={winners.indexOf(winner) === 0}
              isCurrentPlayer={true}
            />
          </motion.div>
        ))}

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <CButton 
            color="primary" 
            size="lg" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            New Game
          </CButton>
        </motion.div>
      </WinnerCard>
    </WinnerOverlay>
  );
};

// Add this helper function
const checkVoiceAvailability = async (language) => {
  const voices = await new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });

  const languageCode = VOICE_LANGUAGES[language].code;
  return voices.some(voice => voice.lang.startsWith(languageCode));
};

// Add new styled component for game over state
const GameOverOverlay = styled(WinnerOverlay)`
  background: rgba(0, 0, 0, 0.95);
`;

const GameOverCard = styled(WinnerCard)`
  background: linear-gradient(145deg, #8e9eab, #eef2f3);
  color: #333333;
`;

// Add GameOver component
const GameOver = ({ onNewGame }) => (
  <GameOverOverlay
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <GameOverCard
      initial={{ scale: 0, y: -1000 }}
      animate={{ 
        scale: 1, 
        y: 0,
        transition: {
          type: "spring",
          damping: 15,
          stiffness: 100
        }
      }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <h1 className="display-1 mb-4">Game Over!</h1>
        <p className="lead mb-4">No winners after 10 draws</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <CButton 
          color="primary" 
          size="lg" 
          className="mt-4"
          onClick={onNewGame}
        >
          Start New Game
        </CButton>
      </motion.div>
    </GameOverCard>
  </GameOverOverlay>
);

// Update the GameContainer and AnimatedBackground components
const GameContainer = styled(CContainer)`
  min-height: 100vh;
  position: relative;
  padding: 2rem 1rem;
  z-index: 1;
`;

// Add this constant for your background images
const BACKGROUND_IMAGES = [
  '/bingoo.png',
  '/bingoo3.jpg',
  '/bingoo4.jpg',
  '/bingoo5.jpg',
  '/bingoo7.jpg',
  '/bingoo8.jpg',

];

// Update the BackgroundWrapper component
const BackgroundWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
`;

// Update the BackgroundSlide styled component
const BackgroundSlide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.active ? 0.8 : 0};
  transition: opacity 1s ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%) scale(1.1);
    background-image: url(${props => props.image});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: brightness(1.1) contrast(1.1) saturate(1.2);
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    will-change: transform; /* Optimize performance */
    backface-visibility: hidden; /* Prevent flickering */
    -webkit-backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
  }

  /* Add progressive enhancement for modern browsers */
  @supports (object-fit: cover) {
    &::before {
      object-fit: cover;
      object-position: center;
    }
  }
`;

// Add new styled component for image container
const BackgroundImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000; /* Add black background to prevent any white showing */
`;

// Update the BackgroundCarousel component
const BackgroundCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = BACKGROUND_IMAGES.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % BACKGROUND_IMAGES.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  if (!imagesLoaded) {
    return <BackgroundWrapper>Loading...</BackgroundWrapper>;
  }

  return (
    <BackgroundWrapper>
      <BackgroundImageContainer>
        {BACKGROUND_IMAGES.map((image, index) => (
          <BackgroundSlide
            key={image}
            image={image}
            active={index === currentImageIndex}
          />
        ))}
      </BackgroundImageContainer>
    </BackgroundWrapper>
  );
};

const AnimatedBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, rgba(238, 119, 82, 0.7), rgba(231, 60, 126, 0.7), rgba(35, 166, 213, 0.7), rgba(35, 213, 171, 0.7));
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  z-index: -1;
  mix-blend-mode: overlay;

  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Update the BingoGame component to use GameContainer
const BingoGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [lastCalledNumber, setLastCalledNumber] = useState(null);
  const [winners, setWinners] = useState([]);
  const [activeGroup, setActiveGroup] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [drawCount, setDrawCount] = useState(0);
  const [drawLimit, setDrawLimit] = useState(10);

  // Initialize voices when component mounts
  useEffect(() => {
    const init = async () => {
      await initializeVoices();
    };
    init();
  }, []);

  const startGame = (setupPlayers, language, limit) => {
    console.log('Starting game with language:', language, 'and draw limit:', limit);
    setPlayers(setupPlayers);
    setSelectedLanguage(language || 'English');
    setDrawLimit(limit);
    setGameState('playing');

    // Test speech synthesis
    speak('Welcome to Bingo!', language || 'English')
      .catch(error => console.error('Speech synthesis test failed:', error));
  };

  const markNumberForAllPlayers = (number) => {
    setPlayers(currentPlayers => 
      currentPlayers.map(player => ({
        ...player,
        card: player.card.map(row =>
          row.map(cell =>
            cell.number === number 
              ? { ...cell, marked: true }
              : { ...cell } // Preserve existing cell state
          )
        )
      }))
    );
  };

  const callNumber = async () => {
    // First check for draw limit - exit immediately if limit reached
    if (drawCount >= drawLimit || calledNumbers.length === 75 || gameState !== 'playing' || isSpeaking) {
      if (autoPlay) {
        // Stop auto play if we've reached the limit
        clearInterval(intervalId);
        setIntervalId(null);
        setAutoPlay(false);
      }
      return;
    }

    try {
      setIsSpeaking(true);
      const newCall = generateCalledNumber(calledNumbers);
      if (!newCall) return;

      // Increment draw count before proceeding
      const newDrawCount = drawCount + 1;
      setDrawCount(newDrawCount);

      // If this was the last allowed draw, set game state to finished
      if (newDrawCount >= drawLimit) {
        setGameState('finished');
        // Stop auto play if running
        if (autoPlay) {
          clearInterval(intervalId);
          setIntervalId(null);
          setAutoPlay(false);
        }
      }

      setLastCalledNumber(newCall);
      setCalledNumbers(prev => [...prev, newCall]);

      const announcementText = getAnnouncementText(newCall.column, newCall.number, selectedLanguage);
      console.log('Speaking:', announcementText);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await speak(announcementText, selectedLanguage);

      await new Promise(resolve => setTimeout(resolve, 2000));

      markNumberForAllPlayers(newCall.number);

    } catch (error) {
      console.error('Error calling number:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const newWinners = players
      .filter(player => checkWin(player.card) && !winners.includes(player))
      .slice(0, 2 - winners.length);

    if (newWinners.length > 0) {
      setWinners([...winners, ...newWinners]);
      if (winners.length === 0) {
        setGameState('winner');
      }
    } else {
      setCurrentPlayer((currentPlayer + 1) % players.length);
    }
  }, [calledNumbers]);

  const checkWin = (card) => {
    for (let i = 0; i < 5; i++) {
      if (card[i].every(cell => cell.marked)) return true;
      if (card.every(row => row[i].marked)) return true;
    }
    
    if (card.every((row, index) => row[index].marked)) return true;
    if (card.every((row, index) => row[4 - index].marked)) return true;
    
    return false;
  };

  useEffect(() => {
    const checkVoice = async () => {
      const isAvailable = await checkVoiceAvailability(selectedLanguage);
      if (!isAvailable) {
        alert(`Voice for ${VOICE_LANGUAGES[selectedLanguage].label} is not available. Using English as fallback.`);
      }
    };
    
    if (gameState === 'playing') {
      checkVoice();
    }
  }, [selectedLanguage, gameState]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();

      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      };
    }
  }, []);

  // Update toggleAutoPlay function
  const toggleAutoPlay = async () => {
    if (autoPlay) {
      // Stop auto play
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } else {
      // Only start if we haven't reached the limit
      if (drawCount >= drawLimit) {
        return;
      }

      // Start auto play
      const id = setInterval(async () => {
        // Check if we should stop based on current state
        if (drawCount >= drawLimit || calledNumbers.length === 75 || gameState !== 'playing' || isSpeaking) {
          clearInterval(id);
          setIntervalId(null);
          setAutoPlay(false);
          if (drawCount >= drawLimit && !winners.length) {
            setGameState('finished');
          }
          return;
        }

        // Call number if not speaking
        if (!isSpeaking) {
          try {
            setIsSpeaking(true);
            const newCall = generateCalledNumber(calledNumbers);
            if (!newCall) {
              clearInterval(id);
              setIntervalId(null);
              setAutoPlay(false);
              return;
            }

            // Increment draw count
            const newDrawCount = drawCount + 1;
            setDrawCount(newDrawCount);

            // Check if this is the last draw
            if (newDrawCount >= drawLimit) {
              setGameState('finished');
              clearInterval(id);
              setIntervalId(null);
              setAutoPlay(false);
            }

            setLastCalledNumber(newCall);
            setCalledNumbers(prev => [...prev, newCall]);

            const announcementText = getAnnouncementText(newCall.column, newCall.number, selectedLanguage);
            console.log('Speaking:', announcementText);

            await new Promise(resolve => setTimeout(resolve, 2000));
            await speak(announcementText, selectedLanguage);
            await new Promise(resolve => setTimeout(resolve, 2000));

            markNumberForAllPlayers(newCall.number);
          } catch (error) {
            console.error('Error in auto play:', error);
          } finally {
            setIsSpeaking(false);
          }
        }
      }, 10000);
      
      setIntervalId(id);
    }
    setAutoPlay(!autoPlay);
  };

  // Add cleanup effect
  useEffect(() => {
    // Cleanup function to clear interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Add effect to monitor draw count
  useEffect(() => {
    if (drawCount >= drawLimit) {
      // Stop auto play if running
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
        setAutoPlay(false);
      }
      setGameState('finished');
    }
  }, [drawCount, drawLimit]);

  useEffect(() => {
    console.log('Called Numbers:', calledNumbers);
    console.log('Players State:', players);
  }, [calledNumbers, players]);

  const handleNewGame = () => {
    setGameState('setup');
    setDrawCount(0);
    setCalledNumbers([]);
    setLastCalledNumber(null);
    setWinners([]);
    setPlayers([]);
    setCurrentPlayer(0);
    setActiveGroup(0);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setAutoPlay(false);
  };

  if (gameState === 'setup') {
    return (
      <GameContainer fluid>
        <BackgroundCarousel />
        <AnimatedBackground />
        <PlayerSetup onStartGame={startGame} />
      </GameContainer>
    );
  }

  const playerGroups = [];
  for (let i = 0; i < players.length; i += 10) {
    playerGroups.push(players.slice(i, i + 10));
  }

  return (
    <GameContainer fluid>
      <BackgroundCarousel />
      <AnimatedBackground />
      <div className="bg-light p-5 mb-4 rounded shadow-lg">
        <motion.h1 
          className="display-3 text-center"
          animate={{ 
            scale: [1, 1.05, 1],
            color: ['#333', '#ff6b6b', '#333']
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
        >
          Bingo Night!
        </motion.h1>
        <CRow className="justify-content-center mb-3">
          <CCol xs="12" md="6" className="text-center">
            <div className="d-flex justify-content-center gap-3">
              <CButton
                color="primary"
                size="lg"
                onClick={callNumber}
                disabled={gameState === 'finished' || isSpeaking || autoPlay || drawCount >= drawLimit}
                className="shadow"
              >
                <CIcon icon={cilVolumeHigh} className="me-2" />
                {isSpeaking ? 'Speaking...' : drawCount >= drawLimit ? 'Game Over' : 'Call Number'}
              </CButton>
              <CButton
                color={autoPlay ? 'danger' : 'success'}
                size="lg"
                onClick={toggleAutoPlay}
                disabled={gameState === 'finished' || drawCount >= drawLimit}
                className="shadow"
              >
                {autoPlay ? 'Stop Auto Call' : 'Start Auto Call'}
              </CButton>
            </div>
          </CCol>
        </CRow>

        <DrawCounter>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Draw {drawCount}/{drawLimit}</span>
        </DrawCounter>

        {lastCalledNumber && (
          <CallNumberAnimation 
            number={lastCalledNumber.number} 
            column={lastCalledNumber.column}
          />
        )}
        {winners.length > 0 && (
          <CAlert color="success" className="text-center shadow-lg">
            <h3 className="mb-2">
              BINGO! {winners.map(w => w.name).join(', ')} {winners.length === 1 ? 'has' : 'have'} won!
            </h3>
            {gameState !== 'finished' && (
              <p className="mb-0">The game continues for other players to achieve Bingo as well.</p>
            )}
          </CAlert>
        )}
      </div>

      <CCard className="shadow-lg">
        <CCardHeader>
          <CNav variant="tabs" role="tablist" className="card-header bg-dark text-white">
            {playerGroups.map((_, index) => (
              <CNavItem key={index}>
                <CNavLink
                  active={activeGroup === index}
                  onClick={() => setActiveGroup(index)}
                  style={{ cursor: 'pointer' }}
                >
                  Group {index + 1}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>
        </CCardHeader>
        <CCardBody>
          <CTabContent>
            {playerGroups.map((group, groupIndex) => (
              <CTabPane key={groupIndex} visible={activeGroup === groupIndex}>
                <CRow className="g-4">
                  {group.map((player, index) => (
                    <CCol key={index} xs={12} sm={6} md={4} lg={3} xl={5}>
                      <CCard className="h-100 shadow-sm">
                        <CCardHeader className={`bg-${player.color} text-white`}>
                          <h4 className="mb-0">{player.name}'s Card</h4>
                        </CCardHeader>
                        <CCardBody className="p-2">
                          <BingoCard 
                            card={player.card} 
                            color={player.color}
                            isFirst={index === 0 && groupIndex === 0}
                            isCurrentPlayer={players.indexOf(player) === currentPlayer && gameState === 'playing'}
                          />
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              </CTabPane>
            ))}
          </CTabContent>
        </CCardBody>
      </CCard>

      {gameState === 'winner' && <WinnerPopup winners={winners} />}
      {drawCount >= drawLimit && !winners.length && <GameOver onNewGame={handleNewGame} />}
    </GameContainer>
  );
};

export default BingoGame;
