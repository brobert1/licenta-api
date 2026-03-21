/* eslint-disable no-console */
import { Chess } from 'chess.js';
import { Game, DailyStats } from '@models';
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

// Track disconnection timeouts: gameId -> { oderId, timeoutId }
// Disconnect grace period in milliseconds (60 seconds)
const DISCONNECT_GRACE_PERIOD = 60 * 1000;
const disconnectTimeouts = new Map();

/**
 * Upsert daily stats for both players after a live game ends.
 */
const recordLiveGameStats = async (whitePlayerId, blackPlayerId, result, eloChanges) => {
  const date = new Date().toISOString().slice(0, 10);

  const buildInc = (role) => {
    const inc = {};
    if (result === '1-0') inc[role === 'white' ? 'wins' : 'losses'] = 1;
    else if (result === '0-1') inc[role === 'white' ? 'losses' : 'wins'] = 1;
    else inc.draws = 1;
    const delta = eloChanges?.[role]?.delta;
    if (delta) inc.eloGained = delta;
    return inc;
  };

  await Promise.all([
    DailyStats.findOneAndUpdate(
      { user: whitePlayerId.toString(), date },
      { $inc: buildInc('white') },
      { upsert: true }
    ),
    DailyStats.findOneAndUpdate(
      { user: blackPlayerId.toString(), date },
      { $inc: buildInc('black') },
      { upsert: true }
    ),
  ]);
};

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

      // Update ELO and daily stats
      const eloChanges = await updateEloRatings(gameId);
      await recordLiveGameStats(game.whitePlayer, game.blackPlayer, gameResult, eloChanges);
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
      await recordLiveGameStats(game.whitePlayer, game.blackPlayer, result, eloChanges);

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

      if (game.lastDrawOfferBy === playerColor && game.lastDrawOfferAt) {
        const timeSinceLastOffer = Date.now() - new Date(game.lastDrawOfferAt).getTime();
        const cooldownMs = 60 * 1000; // 1 minute

        if (timeSinceLastOffer < cooldownMs) {
          const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOffer) / 1000);
          return socket.emit('actionError', {
            message: `Please wait ${remainingSeconds}s before offering a draw again.`,
          });
        }
      }

      // Update game with draw offer info
      await Game.findByIdAndUpdate(gameId, {
        lastDrawOfferBy: playerColor,
        lastDrawOfferAt: new Date(),
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
      await recordLiveGameStats(game.whitePlayer, game.blackPlayer, '1/2-1/2', eloChanges);

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
    await recordLiveGameStats(game.whitePlayer, game.blackPlayer, result, eloChanges);

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

  // Handle active game disconnection - update socket mapping but keep game active
  const gameId = socketToGame.get(socket.id);
  if (gameId) {
    const gameSockets = activeGames.get(gameId);
    if (gameSockets) {
      const isWhite = gameSockets.whiteSocketId === socket.id;
      const disconnectedColor = isWhite ? 'white' : 'black';

      // Notify the opponent that this player disconnected
      const opponentSocketId = isWhite ? gameSockets.blackSocketId : gameSockets.whiteSocketId;
      if (opponentSocketId) {
        const opponentSocket = io.sockets.sockets.get(opponentSocketId);
        if (opponentSocket) {
          opponentSocket.emit('opponentDisconnected', {
            gracePeriod: DISCONNECT_GRACE_PERIOD,
          });
        }
      }

      // Mark the player as disconnected but don't end the game yet
      if (isWhite) {
        gameSockets.whiteSocketId = null;
      } else {
        gameSockets.blackSocketId = null;
      }

      // Start disconnect timeout - player has grace period to reconnect
      const timeoutId = setTimeout(async () => {
        await handleDisconnectTimeout(io, gameId, disconnectedColor);
      }, DISCONNECT_GRACE_PERIOD);

      // Store timeout info so we can cancel it if player reconnects
      const existingTimeouts = disconnectTimeouts.get(gameId) || {};
      existingTimeouts[disconnectedColor] = timeoutId;
      disconnectTimeouts.set(gameId, existingTimeouts);

      console.log(
        `Player (${disconnectedColor}) disconnected from game ${gameId} - ${
          DISCONNECT_GRACE_PERIOD / 1000
        }s grace period started`
      );
    }
    socketToGame.delete(socket.id);
  }
};

/**
 * Handle disconnect timeout - forfeit game for disconnected player
 */
const handleDisconnectTimeout = async (io, gameId, disconnectedColor) => {
  try {
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'active') {
      // Game already ended or doesn't exist
      disconnectTimeouts.delete(gameId);
      return;
    }

    const gameSockets = activeGames.get(gameId);
    if (!gameSockets) {
      disconnectTimeouts.delete(gameId);
      return;
    }

    // Check if the player is still disconnected
    const isStillDisconnected =
      disconnectedColor === 'white'
        ? gameSockets.whiteSocketId === null
        : gameSockets.blackSocketId === null;

    if (!isStillDisconnected) {
      // Player reconnected, don't forfeit
      return;
    }

    // Player didn't reconnect in time - they lose
    const result = disconnectedColor === 'white' ? '0-1' : '1-0';

    await Game.findByIdAndUpdate(gameId, {
      status: 'completed',
      result,
    });

    const eloChanges = await updateEloRatings(gameId);
    await recordLiveGameStats(game.whitePlayer, game.blackPlayer, result, eloChanges);

    // Notify the remaining player
    const winnerSocketId =
      disconnectedColor === 'white' ? gameSockets.blackSocketId : gameSockets.whiteSocketId;

    if (winnerSocketId) {
      const winnerSocket = io.sockets.sockets.get(winnerSocketId);
      if (winnerSocket) {
        winnerSocket.emit('gameOver', {
          result,
          reason: 'Opponent abandoned the game',
          eloChange: eloChanges?.[disconnectedColor === 'white' ? 'black' : 'white']?.delta || 0,
        });
      }
    }

    // Clean up
    activeGames.delete(gameId);
    disconnectTimeouts.delete(gameId);

    console.log(`Game ${gameId} ended - ${disconnectedColor} forfeited due to disconnect timeout`);
  } catch (err) {
    console.error('Error handling disconnect timeout:', err);
  }
};

/**
 * Handle player rejoining an active game after disconnect/page refresh
 */
export const rejoinGame = async (io, socket) => {
  try {
    const userId = socket.user._id.toString();
    const { Identity } = await import('@models');

    // Find any active game where this user is a player
    const activeGame = await Game.findOne({
      status: 'active',
      $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
    }).lean();

    if (!activeGame) {
      return socket.emit('noActiveGame');
    }

    const gameId = activeGame._id.toString();
    const isWhite = activeGame.whitePlayer.toString() === userId;
    const playerColor = isWhite ? 'white' : 'black';

    // Cancel any pending disconnect timeout for this player
    const existingTimeouts = disconnectTimeouts.get(gameId);
    if (existingTimeouts && existingTimeouts[playerColor]) {
      clearTimeout(existingTimeouts[playerColor]);
      delete existingTimeouts[playerColor];
      console.log(`Cancelled disconnect timeout for ${playerColor} in game ${gameId}`);
    }

    // Get opponent info
    const opponentId = isWhite ? activeGame.blackPlayer : activeGame.whitePlayer;
    const opponent = await Identity.findById(opponentId).select('name elo image').lean();

    // Update or create the active games tracking
    let gameSockets = activeGames.get(gameId);
    if (!gameSockets) {
      // Game exists in DB but not in memory - restore it
      gameSockets = {
        whiteSocketId: null,
        blackSocketId: null,
      };
      activeGames.set(gameId, gameSockets);
    }

    // Update the socket ID for the reconnecting player
    if (isWhite) {
      gameSockets.whiteSocketId = socket.id;
    } else {
      gameSockets.blackSocketId = socket.id;
    }

    // Update socket-to-game mapping
    socketToGame.set(socket.id, gameId);

    // Calculate elapsed time since last move
    const now = Date.now();
    const lastMoveAt = activeGame.lastMoveAt ? new Date(activeGame.lastMoveAt).getTime() : now;
    const elapsedMs = now - lastMoveAt;

    // Determine whose turn it is
    const currentTurn = activeGame.fen.split(' ')[1];
    const isWhiteTurn = currentTurn === 'w';

    // Adjust time based on elapsed time since last move
    let whiteTimeRemaining = activeGame.whiteTimeRemaining;
    let blackTimeRemaining = activeGame.blackTimeRemaining;

    if (isWhiteTurn) {
      whiteTimeRemaining = Math.max(0, whiteTimeRemaining - elapsedMs);
    } else {
      blackTimeRemaining = Math.max(0, blackTimeRemaining - elapsedMs);
    }

    // Update times in database
    await Game.findByIdAndUpdate(gameId, {
      whiteTimeRemaining,
      blackTimeRemaining,
      lastMoveAt: now,
    });

    console.log(`Player ${userId} rejoined game ${gameId} as ${playerColor}`);

    // Send game state to the reconnecting player
    socket.emit('gameRejoined', {
      gameId,
      color: playerColor,
      opponent: {
        name: opponent?.name || activeGame[isWhite ? 'black' : 'white'],
        elo: opponent?.elo || 1200,
        image: opponent?.image,
      },
      timeControl: activeGame.timeControl,
      fen: activeGame.fen,
      pgn: activeGame.pgn || '',
      whiteTime: whiteTimeRemaining,
      blackTime: blackTimeRemaining,
      lastMove:
        activeGame.uciMoves?.length > 0
          ? {
              from: activeGame.uciMoves[activeGame.uciMoves.length - 1].slice(0, 2),
              to: activeGame.uciMoves[activeGame.uciMoves.length - 1].slice(2, 4),
            }
          : null,
      chatStatus: activeGame.chatStatus,
      chatRequestedBy: activeGame.chatRequestedBy,
      messages: [], // We'll decrypt and send messages separately if chat is active
    });

    // If chat was active, send decrypted messages
    if (activeGame.chatStatus === 'active' && activeGame.messages?.length > 0) {
      const { decrypt } = await import('@functions/encryption');
      activeGame.messages.forEach((msg) => {
        try {
          const content = decrypt(msg.content, msg.iv);
          socket.emit('messageReceived', {
            gameId,
            sender: msg.sender,
            senderName: msg.senderName,
            content,
            timestamp: msg.timestamp,
          });
        } catch (e) {
          console.error('Failed to decrypt message during rejoin', e);
        }
      });
    }

    // Notify the opponent that the player reconnected
    const opponentSocketId = isWhite ? gameSockets.blackSocketId : gameSockets.whiteSocketId;
    if (opponentSocketId) {
      const opponentSocket = io.sockets.sockets.get(opponentSocketId);
      if (opponentSocket) {
        opponentSocket.emit('opponentReconnected');
      }
    }
  } catch (err) {
    console.error('Error in rejoinGame:', err);
    socket.emit('rejoinError', { message: 'Failed to rejoin game' });
  }
};

/**
 * Handle sending a chat message in a live game
 */
export const sendMessage = async (io, socket, { gameId, message }) => {
  try {
    // Import encryption dynamically to avoid circular dependencies
    const { encrypt } = await import('@functions/encryption');
    const { Identity } = await import('@models');

    const game = await Game.findById(gameId);
    if (!game || game.status !== 'active') {
      return socket.emit('messageError', { message: 'Game not found or not active' });
    }

    const userId = socket.user._id.toString();
    const isWhite = game.whitePlayer.toString() === userId;
    const isBlack = game.blackPlayer.toString() === userId;

    if (!isWhite && !isBlack) {
      return socket.emit('messageError', { message: 'Not a player in this game' });
    }

    const playerColor = isWhite ? 'white' : 'black';

    // Validate message
    const trimmedMessage = message?.trim();
    if (!trimmedMessage || trimmedMessage.length === 0) {
      return socket.emit('messageError', { message: 'Message cannot be empty' });
    }

    if (trimmedMessage.length > 200) {
      return socket.emit('messageError', { message: 'Message too long (max 200 characters)' });
    }

    // Get sender info
    const sender = await Identity.findById(userId).select('name');
    const senderName = sender?.name || 'Unknown';

    // Encrypt the message
    const { encrypted, iv } = encrypt(trimmedMessage);
    const timestamp = new Date();

    // Determine chat flow based on status
    let updateQuery = {
      $push: {
        messages: {
          sender: userId,
          senderName,
          content: encrypted,
          iv,
          timestamp,
        },
      },
    };

    let newChatStatus = game.chatStatus;

    // First message starts the request flow if initial
    if (game.chatStatus === 'initial') {
      newChatStatus = 'pending';
      updateQuery.chatStatus = 'pending';
      updateQuery.chatRequestedBy = playerColor;
    }

    // Save to database
    await Game.findByIdAndUpdate(gameId, updateQuery);

    // Broadcast logic
    const gameIdStr = gameId.toString();
    const gameSockets = activeGames.get(gameIdStr);

    if (gameSockets) {
      const messageData = {
        gameId,
        sender: userId,
        senderName,
        content: trimmedMessage, // Send decrypted to clients
        timestamp,
      };

      const whiteSocket = io.sockets.sockets.get(gameSockets.whiteSocketId);
      const blackSocket = io.sockets.sockets.get(gameSockets.blackSocketId);
      const senderSocket = isWhite ? whiteSocket : blackSocket;
      const opponentSocket = isWhite ? blackSocket : whiteSocket;

      // Always send to sender so they see their own message
      if (senderSocket) {
        senderSocket.emit('messageReceived', messageData);
      }

      // Handle opponent visibility
      if (newChatStatus === 'active') {
        // Normal chat - send to opponent
        if (opponentSocket) {
          opponentSocket.emit('messageReceived', messageData);
        }
      } else if (newChatStatus === 'pending') {
        // If this was the triggering message, notify opponent of request
        if (game.chatStatus === 'initial' && opponentSocket) {
          opponentSocket.emit('chatRequest', {
            requestedBy: playerColor,
            senderName,
          });
        }
        // If already pending, we don't spam requests, just save message (invisible to opponent)
      }
      // If rejected, do nothing for opponent (message saved but invisible)
    }

    console.log(`Message sent in game ${gameId} by ${senderName} (Status: ${newChatStatus})`);
  } catch (err) {
    console.error('Error in sendMessage:', err);
    socket.emit('messageError', { message: 'Failed to send message' });
  }
};

/**
 * Handle chat actions (accept, decline)
 */
export const chatAction = async (io, socket, { gameId, action }) => {
  try {
    const { decrypt } = await import('@functions/encryption'); // Need decrypt to send history
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'active') {
      return;
    }

    const userId = socket.user._id.toString();
    const isWhite = game.whitePlayer.toString() === userId;
    const isBlack = game.blackPlayer.toString() === userId;

    if (!isWhite && !isBlack) return;

    // Only allow action if status is pending
    if (game.chatStatus !== 'pending') return;

    // Only opponent can accept/decline
    const requestor = game.chatRequestedBy; // 'white' or 'black'
    const responderColor = isWhite ? 'white' : 'black';

    if (requestor === responderColor) {
      return socket.emit('messageError', { message: 'Cannot respond to own request' });
    }

    const gameIdStr = gameId.toString();
    const gameSockets = activeGames.get(gameIdStr);
    if (!gameSockets) return;

    const whiteSocket = io.sockets.sockets.get(gameSockets.whiteSocketId);
    const blackSocket = io.sockets.sockets.get(gameSockets.blackSocketId);
    const requestorSocket = requestor === 'white' ? whiteSocket : blackSocket;
    const responderSocket = responderColor === 'white' ? whiteSocket : blackSocket;

    if (action === 'accept') {
      // Activate chat
      await Game.findByIdAndUpdate(gameId, { chatStatus: 'active' });

      // Notify both
      if (whiteSocket) whiteSocket.emit('chatActive');
      if (blackSocket) blackSocket.emit('chatActive');

      // Send buffered messages to the responder (the one who just accepted)
      if (responderSocket && game.messages && game.messages.length > 0) {
        game.messages.forEach((msg) => {
          // Only send messages that belong to this chat session (could filter by date if needed)
          // For now, we trust the array. decrypt and send.
          try {
            const content = decrypt(msg.content, msg.iv);
            responderSocket.emit('messageReceived', {
              gameId,
              sender: msg.sender,
              senderName: msg.senderName,
              content,
              timestamp: msg.timestamp,
            });
          } catch (e) {
            console.error('Failed to decrypt message in backlog', e);
          }
        });
      }
    } else if (action === 'decline') {
      // Reject chat
      await Game.findByIdAndUpdate(gameId, { chatStatus: 'rejected' });

      // Notify requestor
      if (requestorSocket) {
        requestorSocket.emit('chatRejected');
      }
      // Notify responder (to close the request card)
      if (responderSocket) {
        responderSocket.emit('chatRejected');
      }
    }
  } catch (err) {
    console.error('Error in chatAction:', err);
  }
};
