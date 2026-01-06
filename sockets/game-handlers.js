/* eslint-disable no-console */
import { Chess } from 'chess.js';
import { Game } from '@models';
import {
  addToQueue,
  removeFromQueue,
  findMatch,
  createLiveGame,
  updateEloRatings,
} from './matchmaking';

// Track active games: gameId -> { whiteSocketId, blackSocketId }
const activeGames = new Map();

// Track socket to game mapping: socketId -> gameId
const socketToGame = new Map();

/**
 * Handle user joining the matchmaking queue
 */
export const joinQueue = async (io, socket, { timeControl }) => {
  try {
    const userId = socket.user._id.toString();
    console.log(`User ${userId} joining queue for ${timeControl.initial}+${timeControl.increment}`);

    // Add to queue
    const playerEntry = await addToQueue(socket, timeControl);
    if (!playerEntry) {
      return socket.emit('queueError', { message: 'Failed to join queue' });
    }

    // Notify user they joined the queue
    socket.emit('queueJoined', {
      timeControl,
      queuePosition: 'searching',
      eloRange: [playerEntry.elo - 200, playerEntry.elo + 200],
    });

    // Try to find a match
    const match = findMatch(playerEntry);
    if (match) {
      const { whitePlayerEntry, blackPlayerEntry } = match;

      // Create the game
      const game = await createLiveGame(whitePlayerEntry, blackPlayerEntry);

      // Track the game
      activeGames.set(game._id.toString(), {
        whiteSocketId: whitePlayerEntry.socketId,
        blackSocketId: blackPlayerEntry.socketId,
      });
      socketToGame.set(whitePlayerEntry.socketId, game._id.toString());
      socketToGame.set(blackPlayerEntry.socketId, game._id.toString());

      // Notify both players
      const whiteSocket = io.sockets.sockets.get(whitePlayerEntry.socketId);
      const blackSocket = io.sockets.sockets.get(blackPlayerEntry.socketId);

      if (whiteSocket) {
        whiteSocket.emit('gameStart', {
          gameId: game._id.toString(),
          color: 'white',
          opponent: {
            name: blackPlayerEntry.name,
            elo: blackPlayerEntry.elo,
            image: blackPlayerEntry.image,
          },
          timeControl: game.timeControl,
          fen: game.fen,
        });
      }

      if (blackSocket) {
        blackSocket.emit('gameStart', {
          gameId: game._id.toString(),
          color: 'black',
          opponent: {
            name: whitePlayerEntry.name,
            elo: whitePlayerEntry.elo,
            image: whitePlayerEntry.image,
          },
          timeControl: game.timeControl,
          fen: game.fen,
        });
      }

      console.log(
        `Match created: ${game._id.toString()} - ${whitePlayerEntry.name} vs ${
          blackPlayerEntry.name
        }`
      );
    }
  } catch (err) {
    console.error('Error in joinQueue:', err);
    socket.emit('queueError', { message: 'An error occurred' });
  }
};

/**
 * Handle user leaving the queue
 */
export const leaveQueue = (io, socket) => {
  const userId = socket.user._id.toString();
  const removed = removeFromQueue(userId);
  if (removed) {
    socket.emit('queueLeft');
    console.log(`User ${userId} left queue`);
  }
};

/**
 * Handle a move in a live game
 */
export const makeMove = async (io, socket, { gameId, move }) => {
  try {
    console.log(`makeMove called - gameId: ${gameId}, move:`, move);
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'active') {
      return socket.emit('moveError', { message: 'Game not found or not active' });
    }

    const userId = socket.user._id.toString();
    const isWhite = game.whitePlayer.toString() === userId;
    const isBlack = game.blackPlayer.toString() === userId;

    if (!isWhite && !isBlack) {
      return socket.emit('moveError', { message: 'Not a player in this game' });
    }

    // Load chess with existing PGN to preserve history, or start fresh if no PGN
    const chess = new Chess();
    if (game.pgn) {
      chess.load_pgn(game.pgn);
    } else if (
      game.fen &&
      game.fen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    ) {
      // If there's a custom starting FEN with no PGN, use the FEN
      chess.load(game.fen);
    }

    // Check turn
    const currentTurn = chess.turn();
    if ((currentTurn === 'w' && !isWhite) || (currentTurn === 'b' && !isBlack)) {
      return socket.emit('moveError', { message: 'Not your turn' });
    }

    // Try to make the move
    let result;
    try {
      result = chess.move(move);
    } catch (e) {
      return socket.emit('moveError', { message: 'Invalid move' });
    }

    if (!result) {
      return socket.emit('moveError', { message: 'Invalid move' });
    }

    // Update game state
    const newFen = chess.fen();
    const newUciMoves = [...game.uciMoves, result.from + result.to + (result.promotion || '')];
    const newPgn = chess.pgn();

    // Calculate time consumption and remaining time
    const now = new Date();
    const incrementMs = game.timeControl.increment * 1000;

    // Calculate new time remaining for the player who just moved
    let newWhiteTime = game.whiteTimeRemaining;
    let newBlackTime = game.blackTimeRemaining;

    // Only deduct time if this is NOT the first move of the game
    // (First move: clock hasn't started yet, just add increment if any)
    const isFirstMove = game.uciMoves.length === 0;
    
    if (isFirstMove) {
      // First move - don't deduct time, just add increment for the player who moved
      if (isWhite) {
        newWhiteTime = game.whiteTimeRemaining + incrementMs;
      } else {
        newBlackTime = game.blackTimeRemaining + incrementMs;
      }
    } else {
      // Subsequent moves - calculate elapsed time and deduct
      const lastMoveAt = game.lastMoveAt ? new Date(game.lastMoveAt) : now;
      const elapsedMs = Math.max(0, now - lastMoveAt);

      if (isWhite) {
        // White just moved - subtract elapsed time, add increment
        newWhiteTime = Math.max(0, game.whiteTimeRemaining - elapsedMs + incrementMs);
      } else {
        // Black just moved - subtract elapsed time, add increment  
        newBlackTime = Math.max(0, game.blackTimeRemaining - elapsedMs + incrementMs);
      }
    }

    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      {
        fen: newFen,
        uciMoves: newUciMoves,
        pgn: newPgn,
        moves: newUciMoves.length,
        whiteTimeRemaining: newWhiteTime,
        blackTimeRemaining: newBlackTime,
        lastMoveAt: now,
      },
      { new: true }
    );

    // Check for game over
    let gameOver = false;
    let gameResult = '*';
    if (chess.in_checkmate()) {
      gameOver = true;
      gameResult = chess.turn() === 'w' ? '0-1' : '1-0';
    } else if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) {
      gameOver = true;
      gameResult = '1/2-1/2';
    }

    if (gameOver) {
      await Game.findByIdAndUpdate(gameId, {
        status: 'completed',
        result: gameResult,
      });

      // Update ELO
      await updateEloRatings(gameId);
    }

    // Broadcast move to both players
    const gameIdStr = gameId.toString();
    console.log(
      `Looking up game sockets for gameId: ${gameIdStr}, activeGames size: ${activeGames.size}`
    );
    const gameSockets = activeGames.get(gameIdStr);
    if (gameSockets) {
      console.log(
        `Found sockets: white=${gameSockets.whiteSocketId}, black=${gameSockets.blackSocketId}`
      );
      const moveData = {
        gameId,
        move: result,
        fen: newFen,
        pgn: newPgn,
        whiteTime: updatedGame.whiteTimeRemaining,
        blackTime: updatedGame.blackTimeRemaining,
        gameOver,
        result: gameResult,
        lastMove: { from: result.from, to: result.to },
      };

      [gameSockets.whiteSocketId, gameSockets.blackSocketId].forEach((sid) => {
        const playerSocket = io.sockets.sockets.get(sid);
        console.log(`Emitting moveMade to socket ${sid}, found: ${!!playerSocket}`);
        if (playerSocket) {
          playerSocket.emit('moveMade', moveData);
        }
      });
    } else {
      console.log(`No game sockets found for gameId: ${gameIdStr}`);
    }

    console.log(`Move made in game ${gameId}: ${result.san}`);
  } catch (err) {
    console.error('Error in makeMove:', err);
    socket.emit('moveError', { message: 'An error occurred' });
  }
};

/**
 * Handle game actions (resign, draw offer, etc.)
 */
export const gameAction = async (io, socket, { gameId, action }) => {
  try {
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'active') {
      return socket.emit('actionError', { message: 'Game not found or not active' });
    }

    const userId = socket.user._id.toString();
    const isWhite = game.whitePlayer.toString() === userId;
    const isBlack = game.blackPlayer.toString() === userId;

    if (!isWhite && !isBlack) {
      return socket.emit('actionError', { message: 'Not a player in this game' });
    }

    const gameIdStr = gameId.toString();
    const gameSockets = activeGames.get(gameIdStr);
    if (!gameSockets) {
      return socket.emit('actionError', { message: 'Game sockets not found' });
    }

    if (action === 'resign') {
      const result = isWhite ? '0-1' : '1-0';
      await Game.findByIdAndUpdate(gameId, {
        status: 'completed',
        result,
      });

      const eloChanges = await updateEloRatings(gameId);

      // Notify both players with their ELO changes
      const whiteSid = gameSockets.whiteSocketId;
      const blackSid = gameSockets.blackSocketId;

      const whiteSocket = io.sockets.sockets.get(whiteSid);
      if (whiteSocket) {
        whiteSocket.emit('gameOver', {
          result,
          reason: 'resignation',
          eloChange: eloChanges?.white?.delta || 0,
        });
      }

      const blackSocket = io.sockets.sockets.get(blackSid);
      if (blackSocket) {
        blackSocket.emit('gameOver', {
          result,
          reason: 'resignation',
          eloChange: eloChanges?.black?.delta || 0,
        });
      }

      // Clean up
      activeGames.delete(gameId);
      socketToGame.delete(gameSockets.whiteSocketId);
      socketToGame.delete(gameSockets.blackSocketId);

      console.log(`Game ${gameId} ended by resignation: ${result}`);
    } else if (action === 'offerDraw') {
      // Spam prevention: Check if this player already offered a draw recently (1 minute cooldown)
      const playerColor = isWhite ? 'white' : 'black';
      
      if (
        game.lastDrawOfferBy === playerColor && 
        game.lastDrawOfferAt
      ) {
        const timeSinceLastOffer = Date.now() - new Date(game.lastDrawOfferAt).getTime();
        const cooldownMs = 60 * 1000; // 1 minute
        
        if (timeSinceLastOffer < cooldownMs) {
          const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOffer) / 1000);
          return socket.emit('actionError', { 
            message: `Please wait ${remainingSeconds}s before offering a draw again.`
          });
        }
      }

      // Update game with draw offer info
      await Game.findByIdAndUpdate(gameId, {
        lastDrawOfferBy: playerColor,
        lastDrawOfferAt: new Date()
      });

      // Notify opponent
      const opponentSocketId = isWhite ? gameSockets.blackSocketId : gameSockets.whiteSocketId;
      const opponentSocket = io.sockets.sockets.get(opponentSocketId);
      if (opponentSocket) {
        opponentSocket.emit('drawOffered', { gameId });
      }
    } else if (action === 'acceptDraw') {
      await Game.findByIdAndUpdate(gameId, {
        status: 'completed',
        result: '1/2-1/2',
      });

      const eloChanges = await updateEloRatings(gameId);

      // Notify both players with their ELO changes
      const whiteSocket = io.sockets.sockets.get(gameSockets.whiteSocketId);
      if (whiteSocket) {
        whiteSocket.emit('gameOver', {
          result: '1/2-1/2',
          reason: 'agreement',
          eloChange: eloChanges?.white?.delta || 0,
        });
      }

      const blackSocket = io.sockets.sockets.get(gameSockets.blackSocketId);
      if (blackSocket) {
        blackSocket.emit('gameOver', {
          result: '1/2-1/2',
          reason: 'agreement',
          eloChange: eloChanges?.black?.delta || 0,
        });
      }

      // Clean up
      activeGames.delete(gameId);
      socketToGame.delete(gameSockets.whiteSocketId);
      socketToGame.delete(gameSockets.blackSocketId);

      console.log(`Game ${gameId} ended by draw agreement`);
    } else if (action === 'declineDraw') {
      // Notify opponent that draw was declined
      const opponentSocketId = isWhite ? gameSockets.blackSocketId : gameSockets.whiteSocketId;
      const opponentSocket = io.sockets.sockets.get(opponentSocketId);
      if (opponentSocket) {
        opponentSocket.emit('drawDeclined', { gameId });
      }
      console.log(`Draw declined in game ${gameId}`);
    }
  } catch (err) {
    console.error('Error in gameAction:', err);
    socket.emit('actionError', { message: 'An error occurred' });
  }
};

/**
 * Handle timeout (flag fall) - when a player runs out of time
 */
export const handleTimeout = async (io, socket, { gameId }) => {
  try {
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'active') {
      return socket.emit('timeoutError', { message: 'Game not found or not active' });
    }

    const userId = socket.user._id.toString();
    const isWhite = game.whitePlayer.toString() === userId;
    const isBlack = game.blackPlayer.toString() === userId;

    if (!isWhite && !isBlack) {
      return socket.emit('timeoutError', { message: 'Not a player in this game' });
    }

    // Determine whose turn it is - that player loses on time
    const currentTurn = game.fen.split(' ')[1];
    const result = currentTurn === 'w' ? '0-1' : '1-0';
    const reason = currentTurn === 'w' ? 'White ran out of time' : 'Black ran out of time';

    await Game.findByIdAndUpdate(gameId, {
      status: 'completed',
      result,
    });

    const eloChanges = await updateEloRatings(gameId);

    // Notify both players with their ELO changes
    const gameSockets = activeGames.get(gameId.toString());
    if (gameSockets) {
      const whiteSocket = io.sockets.sockets.get(gameSockets.whiteSocketId);
      if (whiteSocket) {
        whiteSocket.emit('gameOver', {
          result,
          reason,
          eloChange: eloChanges?.white?.delta || 0,
        });
      }

      const blackSocket = io.sockets.sockets.get(gameSockets.blackSocketId);
      if (blackSocket) {
        blackSocket.emit('gameOver', {
          result,
          reason,
          eloChange: eloChanges?.black?.delta || 0,
        });
      }

      // Clean up
      activeGames.delete(gameId.toString());
      socketToGame.delete(gameSockets.whiteSocketId);
      socketToGame.delete(gameSockets.blackSocketId);
    }

    console.log(`Game ${gameId} ended by timeout: ${reason}`);
  } catch (err) {
    console.error('Error in handleTimeout:', err);
    socket.emit('timeoutError', { message: 'An error occurred' });
  }
};

/**
 * Handle socket disconnection
 */
export const disconnectSocket = (io, socket) => {
  const userId = socket.user._id.toString();

  // Remove from queue
  removeFromQueue(userId);

  // Handle active game disconnection
  const gameId = socketToGame.get(socket.id);
  if (gameId) {
    // For now, just log. In production, you might want to implement:
    // - Reconnection grace period
    // - Auto-resign after timeout
    console.log(`Player disconnected from active game ${gameId}`);
  }
};
