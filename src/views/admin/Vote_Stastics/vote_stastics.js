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
import { cilVolumeHigh } from "@coreui/icons";
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';

const generateBingoCard = (size) => {
  const card = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push({ number: Math.floor(Math.random() * (size * size)) + 1, marked: false });
    }
    card.push(row);
  }
  return card;
};

// Add this styled component for the 3D card effect
const StyledBingoCard = styled(CCard)`
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  perspective: 1000px;

  &:hover {
    transform: rotateX(5deg) rotateY(5deg);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  }
`;

// Add this new styled component
const ResponsiveBingoCardWrapper = styled.div`
  width: 100%;
  padding-bottom: 100%; // This maintains the square aspect ratio
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

// Update the AnimatedCell styled component
const AnimatedCell = styled(CButton)`
  width: 100%;
  height: 100%;
  padding: 0;
  border-radius: 50%;
  font-size: ${props => `calc(16px / ${props.size} + 0.5vw)`};
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &.cell-enter {
    opacity: 0;
    transform: scale(0.8);
  }
  &.cell-enter-active {
    opacity: 1;
    transform: scale(1);
  }
  &.cell-exit {
    opacity: 1;
    transform: scale(1);
  }
  &.cell-exit-active {
    opacity: 0;
    transform: scale(0.8);
  }
`;

const BingoCard = ({ card, color, isCurrentPlayer }) => (
  <StyledBingoCard color={color} className={`mb-0 ${isCurrentPlayer ? 'border-primary border-3' : ''}`}>
    <CCardBody className="p-2">
      <ResponsiveBingoCardWrapper>
        <BingoCardContent size={card.length}>
          {card.flat().map((cell, index) => (
            <CSSTransition
              key={index}
              in={cell.marked}
              timeout={300}
              classNames="cell"
            >
              <AnimatedCell
                color={cell.marked ? 'success' : 'light'}
                disabled={cell.marked}
                size={card.length}
              >
                {cell.number}
              </AnimatedCell>
            </CSSTransition>
          ))}
        </BingoCardContent>
      </ResponsiveBingoCardWrapper>
    </CCardBody>
  </StyledBingoCard>
);

const PlayerSetup = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [cardSize, setCardSize] = useState(6);
  const [players, setPlayers] = useState([]);

  const handleAddPlayer = (name) => {
    if (players.length < playerCount) {
      const colors = ['light', 'info', 'warning', 'danger', 'primary', 'secondary', 'success', 'dark'];
      setPlayers([...players, {
        name,
        card: generateBingoCard(cardSize),
        color: colors[players.length % colors.length]
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
            <CFormLabel htmlFor="cardSize">Card Size (2-10)</CFormLabel>
            <CFormInput
              id="cardSize"
              type="number"
              min="2"
              max="10"
              value={cardSize}
              onChange={(e) => setCardSize(Math.min(10, Math.max(2, parseInt(e.target.value) || 2)))}
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
              onClick={() => onStartGame(players, cardSize)}
            >
              Start Game
            </CButton>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  );
};

const BingoGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [lastCalledNumber, setLastCalledNumber] = useState(null);
  const [winners, setWinners] = useState([]);
  const [activeGroup, setActiveGroup] = useState(0);
  const [cardSize, setCardSize] = useState(6);

  const startGame = (setupPlayers, size) => {
    setPlayers(setupPlayers);
    setCardSize(size);
    setGameState('playing');
  };

  const callNumber = () => {
    if (calledNumbers.length === cardSize * cardSize) return;
    let newNumber;
    do {
      newNumber = Math.floor(Math.random() * (cardSize * cardSize)) + 1;
    } while (calledNumbers.includes(newNumber));
    setCalledNumbers([...calledNumbers, newNumber]);
    setLastCalledNumber(newNumber);
    markNumberForAllPlayers(newNumber);
  };

  const markNumberForAllPlayers = (number) => {
    const updatedPlayers = players.map(player => ({
      ...player,
      card: player.card.map(row =>
        row.map(cell =>
          cell.number === number ? { ...cell, marked: true } : cell
        )
      )
    }));
    setPlayers(updatedPlayers);
  };

  const checkWin = (card) => {
    // Check rows and columns
    for (let i = 0; i < cardSize; i++) {
      if (card[i].every(cell => cell.marked)) return true;
      if (card.every(row => row[i].marked)) return true;
    }
    
    // Check diagonals
    if (card.every((row, index) => row[index].marked)) return true;
    if (card.every((row, index) => row[cardSize - 1 - index].marked)) return true;
    
    return false;
  };

  useEffect(() => {
    const newWinners = players.filter(player => checkWin(player.card) && !winners.includes(player));
    if (newWinners.length > 0) {
      setWinners([...winners, ...newWinners]);
      if (winners.length === 0) {
        setGameState('finished');
      }
    } else {
      setCurrentPlayer((currentPlayer + 1) % players.length);
    }
  }, [calledNumbers]);

  if (gameState === 'setup') {
    return <PlayerSetup onStartGame={startGame} />;
  }

  const playerGroups = [];
  for (let i = 0; i < players.length; i += 10) {
    playerGroups.push(players.slice(i, i + 10));
  }

  return (
    <CContainer fluid>
      <div className="bg-light p-5 mb-4 rounded">
        <h1 className="display-3 text-center">Bingo Night!</h1>
        <CRow className="justify-content-center mb-3">
          <CCol xs="12" md="6" className="text-center">
            <CButton
              color="primary"
              size="lg"
              onClick={callNumber}
              disabled={gameState === 'finished'}
            >
              <CIcon icon={cilVolumeHigh} className="me-2" />
              Call Number
            </CButton>
          </CCol>
        </CRow>
        {lastCalledNumber && (
          <CAlert color="info" className="text-center">
            <h2 className="mb-0">Last called number: {lastCalledNumber}</h2>
          </CAlert>
        )}
        {winners.length > 0 && (
          <CAlert color="success" className="text-center">
            <h3 className="mb-2">
              BINGO! {winners.map(w => w.name).join(', ')} {winners.length === 1 ? 'has' : 'have'} won!
            </h3>
            {gameState !== 'finished' && (
              <p className="mb-0">The game continues for other players to achieve Bingo as well.</p>
            )}
          </CAlert>
        )}
      </div>

      <CCard>
        <CCardHeader>
          <CNav variant="tabs" role="tablist">
            {playerGroups.map((_, index) => (
              <CNavItem key={index}>
                <CNavLink
                  active={activeGroup === index}
                  onClick={() => setActiveGroup(index)}
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
                    <CCol key={index} xs={12} sm={6} md={4} lg={3} xl={cardSize > 6 ? 4 : 3}>
                      <CCard>
                        <CCardHeader>
                          <h4 className="mb-0">{player.name}'s Card</h4>
                        </CCardHeader>
                        <CCardBody className="p-2">
                          <BingoCard 
                            card={player.card} 
                            color={player.color}
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
    </CContainer>
  );
};

export default BingoGame;
