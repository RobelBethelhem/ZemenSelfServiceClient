import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CAlert,
} from '@coreui/react';
import './CheckersGame.css'; 

const BOARD_SIZE = 8;
const PLAYER_1 = 'green';
const PLAYER_2 = 'red';

const initialBoard = () => {
  const board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // Set up initial pieces for PLAYER_2
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: PLAYER_2, isKing: false };
      }
    }
  }

  // Set up initial pieces for PLAYER_1
  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: PLAYER_1, isKing: false };
      }
    }
  }

  return board;
};

const CheckersGame = () => {
  const [board, setBoard] = useState(initialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(
    Math.random() < 0.5 ? PLAYER_1 : PLAYER_2
  );
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('');
  const [scores, setScores] = useState({ [PLAYER_1]: 0, [PLAYER_2]: 0 });
  const [canContinueJumping, setCanContinueJumping] = useState(false);
  const [lastJumpedPiece, setLastJumpedPiece] = useState(null);

  useEffect(() => {
    if (!gameStatus) {
      checkWinner(board);
    }
  }, [board, gameStatus]);

  const isKingRow = (row, player) => {
    return (
      (player === PLAYER_1 && row === 0) ||
      (player === PLAYER_2 && row === BOARD_SIZE - 1)
    );
  };

  const getAllValidMoves = (player) => {
    const moves = [];
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && cell.player === player) {
          const pieceMoves = getValidMoves(r, c, false);
          if (pieceMoves.length > 0) {
            moves.push({ from: { row: r, col: c }, moves: pieceMoves });
          }
        }
      });
    });
    // Prioritize jump moves
    const jumpMoves = moves.filter((m) =>
      m.moves.some((move) => move.isJump)
    );
    return jumpMoves.length > 0 ? jumpMoves : moves;
  };

  const getValidMoves = (row, col, checkJumpsOnly = false) => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves = [];
    
    // Define all possible directions
    const allDirections = [
      [-1, -1], // up-left
      [-1, 1],  // up-right
      [1, -1],  // down-left
      [1, 1]    // down-right
    ];

    // For kings, use all directions. For regular pieces, use only forward directions
    const directions = piece.isKing 
      ? allDirections 
      : piece.player === PLAYER_1 
        ? [[-1, -1], [-1, 1]]  // up directions for PLAYER_1
        : [[1, -1], [1, 1]];   // down directions for PLAYER_2

    // For kings, check multiple steps in each direction
    if (piece.isKing) {
      directions.forEach(([rowDir, colDir]) => {
        let currentRow = row;
        let currentCol = col;
        let distance = 1;

        // Continue checking in this direction until we hit a boundary or piece
        while (true) {
          const newRow = row + (rowDir * distance);
          const newCol = col + (colDir * distance);

          // Check if we're still on the board
          if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
            break;
          }

          const targetCell = board[newRow][newCol];

          // If empty cell and not checking jumps only, add as valid move
          if (!targetCell && !checkJumpsOnly) {
            moves.push({ 
              row: newRow, 
              col: newCol, 
              isJump: false 
            });
          }
          
          // If we hit a piece, check for possible jump
          if (targetCell) {
            const jumpRow = newRow + rowDir;
            const jumpCol = newCol + colDir;

            // Check if jump is possible
            if (
              jumpRow >= 0 && jumpRow < BOARD_SIZE &&
              jumpCol >= 0 && jumpCol < BOARD_SIZE &&
              !board[jumpRow][jumpCol] &&
              targetCell.player !== piece.player
            ) {
              moves.push({
                row: jumpRow,
                col: jumpCol,
                isJump: true,
                captureRow: newRow,
                captureCol: newCol
              });
            }
            break; // Stop checking this direction after finding a piece
          }

          distance++;
        }
      });
    } else {
      // Regular piece movement logic (unchanged)
      directions.forEach(([rowDir, colDir]) => {
        const newRow = row + rowDir;
        const newCol = col + colDir;

        // Regular move
        if (
          !checkJumpsOnly &&
          newRow >= 0 &&
          newRow < BOARD_SIZE &&
          newCol >= 0 &&
          newCol < BOARD_SIZE &&
          !board[newRow][newCol]
        ) {
          moves.push({ row: newRow, col: newCol, isJump: false });
        }

        // Jump move
        const jumpRow = row + rowDir * 2;
        const jumpCol = col + colDir * 2;
        if (
          jumpRow >= 0 &&
          jumpRow < BOARD_SIZE &&
          jumpCol >= 0 &&
          jumpCol < BOARD_SIZE
        ) {
          const jumpOverRow = row + rowDir;
          const jumpOverCol = col + colDir;
          const jumpOverPiece = board[jumpOverRow][jumpOverCol];
          if (
            jumpOverPiece &&
            jumpOverPiece.player !== piece.player &&
            !board[jumpRow][jumpCol]
          ) {
            moves.push({
              row: jumpRow,
              col: jumpCol,
              isJump: true,
              captureRow: jumpOverRow,
              captureCol: jumpOverCol,
            });
          }
        }
      });
    }

    // If there are jump moves available, only return jump moves
    const jumpMoves = moves.filter((move) => move.isJump);
    return jumpMoves.length > 0 ? jumpMoves : moves;
  };

  const getValidJumps = (row, col, board) => {
    const piece = board[row][col];
    if (!piece) return [];

    const jumps = [];
    const directions = piece.isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]  // all directions for kings
      : piece.player === PLAYER_1 
        ? [[-1, -1], [-1, 1]]  // up directions for PLAYER_1
        : [[1, -1], [1, 1]];   // down directions for PLAYER_2

    directions.forEach(([rowDir, colDir]) => {
      // For kings, check multiple distances
      if (piece.isKing) {
        let distance = 1;
        while (true) {
          const jumpOverRow = row + (rowDir * distance);
          const jumpOverCol = col + (colDir * distance);
          const jumpToRow = jumpOverRow + rowDir;
          const jumpToCol = jumpOverCol + colDir;

          // Check if jump position is within bounds
          if (
            jumpToRow < 0 || jumpToRow >= BOARD_SIZE ||
            jumpToCol < 0 || jumpToCol >= BOARD_SIZE ||
            jumpOverRow < 0 || jumpOverRow >= BOARD_SIZE ||
            jumpOverCol < 0 || jumpOverCol >= BOARD_SIZE
          ) {
            break;
          }

          const jumpOverPiece = board[jumpOverRow][jumpOverCol];
          const jumpToCell = board[jumpToRow][jumpToCol];

          // If we find a piece to jump over
          if (
            jumpOverPiece && 
            jumpOverPiece.player !== piece.player && 
            !jumpToCell
          ) {
            jumps.push({
              row: jumpToRow,
              col: jumpToCol,
              isJump: true,
              captureRow: jumpOverRow,
              captureCol: jumpOverCol
            });
            break; // Stop checking this direction after finding a jump
          }

          // If we hit any piece and couldn't jump, stop checking this direction
          if (jumpOverPiece) {
            break;
          }

          distance++;
        }
      } else {
        // Regular piece jump logic
        const jumpOverRow = row + rowDir;
        const jumpOverCol = col + colDir;
        const jumpToRow = jumpOverRow + rowDir;
        const jumpToCol = jumpOverCol + colDir;

        if (
          jumpToRow >= 0 && jumpToRow < BOARD_SIZE &&
          jumpToCol >= 0 && jumpToCol < BOARD_SIZE
        ) {
          const jumpOverPiece = board[jumpOverRow][jumpOverCol];
          const jumpToCell = board[jumpToRow][jumpToCol];

          if (
            jumpOverPiece &&
            jumpOverPiece.player !== piece.player &&
            !jumpToCell
          ) {
            jumps.push({
              row: jumpToRow,
              col: jumpToCol,
              isJump: true,
              captureRow: jumpOverRow,
              captureCol: jumpOverCol
            });
          }
        }
      }
    });

    return jumps;
  };

  const handlePieceClick = (row, col) => {
    const piece = board[row][col];

    // If we're in the middle of multiple jumps with the same piece
    if (canContinueJumping && lastJumpedPiece) {
      if (
        row === lastJumpedPiece.row &&
        col === lastJumpedPiece.col &&
        piece &&
        piece.player === currentPlayer
      ) {
        setSelectedPiece({ row, col });
        setValidMoves(getValidJumps(row, col, board));
      } else {
        // Allow player to select a different piece, ending the multiple jump sequence
        setCanContinueJumping(false);
        setLastJumpedPiece(null);
        if (piece && piece.player === currentPlayer) {
          setSelectedPiece({ row, col });
          setValidMoves(getValidMoves(row, col, false));
        }
      }
      return;
    }

    // Normal piece selection logic
    if (piece && piece.player === currentPlayer) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(row, col, false));
    } else if (
      selectedPiece &&
      validMoves.some(
        (move) => move.row === row && move.col === col
      )
    ) {
      movePiece(row, col);
    }
  };

  const movePiece = (newRow, newCol) => {
    const newBoard = board.map((row) => [...row]);
    const piece = newBoard[selectedPiece.row][selectedPiece.col];
    const move = validMoves.find(
      (m) => m.row === newRow && m.col === newCol
    );

    // Move the piece
    newBoard[selectedPiece.row][selectedPiece.col] = null;
    newBoard[newRow][newCol] = {
      ...piece,
      isKing: piece.isKing || isKingRow(newRow, piece.player),
    };

    // Handle jump
    if (move.isJump) {
      // Remove captured piece
      newBoard[move.captureRow][move.captureCol] = null;
      
      // Update score
      setScores((prev) => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + 1,
      }));

      // Check for additional jumps from the new position
      const additionalJumps = getValidJumps(newRow, newCol, newBoard);
      
      if (additionalJumps.length > 0) {
        // Update board and allow continuing with the same piece
        setBoard(newBoard);
        setCanContinueJumping(true);
        setLastJumpedPiece({ row: newRow, col: newCol });
        setSelectedPiece({ row: newRow, col: newCol });
        setValidMoves(additionalJumps);
        return;
      }
    }

    // Complete the move
    setBoard(newBoard);
    const nextPlayer = currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    setCurrentPlayer(nextPlayer);
    setSelectedPiece(null);
    setValidMoves([]);
    setCanContinueJumping(false);
    setLastJumpedPiece(null);

    // Check if game is over (only when a player has no pieces left)
    checkGameState(newBoard, nextPlayer);
  };

  const checkGameState = (currentBoard, nextPlayer) => {
    // Count pieces for each player
    const pieces = {
      [PLAYER_1]: 0,
      [PLAYER_2]: 0,
    };

    currentBoard.forEach((row) => {
      row.forEach((cell) => {
        if (cell) {
          pieces[cell.player]++;
        }
      });
    });

    // Only end game if a player has no pieces left
    if (pieces[PLAYER_1] === 0) {
      setGameStatus(`${PLAYER_2.toUpperCase()} wins by capturing all pieces!`);
      return;
    }
    if (pieces[PLAYER_2] === 0) {
      setGameStatus(`${PLAYER_1.toUpperCase()} wins by capturing all pieces!`);
      return;
    }
  };

  const checkWinner = (currentBoard) => {
    const pieces = {
      [PLAYER_1]: 0,
      [PLAYER_2]: 0,
    };

    currentBoard.forEach((row) => {
      row.forEach((cell) => {
        if (cell) {
          pieces[cell.player]++;
        }
      });
    });

    if (pieces[PLAYER_1] === 0) {
      setGameStatus(`${PLAYER_2.toUpperCase()} wins!`);
    } else if (pieces[PLAYER_2] === 0) {
      setGameStatus(`${PLAYER_1.toUpperCase()} wins!`);
    }
  };

  const getAllValidJumps = (player) => {
    const jumps = [];
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && cell.player === player) {
          const pieceJumps = getValidJumps(r, c, board);
          if (pieceJumps.length > 0) {
            jumps.push(...pieceJumps);
          }
        }
      });
    });
    return jumps;
  };

  return (
    <CCard className="w-full max-w-xl mx-auto">
      <CCardHeader>
        <CCardTitle className="text-center">Checkers Game</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <div className="d-flex justify-content-between mb-4">
          <CAlert color="success" className="w-48 text-center">
            <strong>Green Score</strong>
            <div>{scores[PLAYER_1]}</div>
          </CAlert>

          <CAlert color="danger" className="w-48 text-center">
            <strong>Red Score</strong>
            <div>{scores[PLAYER_2]}</div>
          </CAlert>
        </div>

        <div className="mb-4">
          <CAlert color="info">
            <span className="me-2">★</span>
            <strong>Current Turn</strong>
            <div>
              {currentPlayer.toUpperCase()}'s turn
              {canContinueJumping && ' (Must continue jumping)'}
            </div>
          </CAlert>
        </div>

        <div className="checkerboard">
          {board.map((row, rowIndex) => (
            <div className="checker-row" key={`row-${rowIndex}`}>
              {row.map((cell, colIndex) => {
                const isValidMove = validMoves.some(
                  (move) => move.row === rowIndex && move.col === colIndex
                );
                const isSelected =
                  selectedPiece?.row === rowIndex &&
                  selectedPiece?.col === colIndex;

                const cellColor =
                  (rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark';
                let cellClass = `checker-cell ${cellColor}`;
                if (isValidMove) cellClass += ' valid-move';
                if (isSelected) cellClass += ' selected';

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cellClass}
                    onClick={() => handlePieceClick(rowIndex, colIndex)}
                  >
                    {cell && (
                      <div
                        className={`piece ${
                          cell.player === PLAYER_1
                            ? 'player1'
                            : 'player2'
                        } ${cell.isKing ? 'king' : ''}`}
                      >
                        {cell.isKing && (
                          <span className="crown-icon">★</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {gameStatus && (
          <CAlert color="warning" className="mt-4 text-center">
            <strong>Game Over</strong>
            <div>{gameStatus}</div>
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  );
};

export default CheckersGame;
