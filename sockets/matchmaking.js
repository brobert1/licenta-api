/* eslint-disable no-console */
import { Game, Identity } from '@models';
import { calculateNewRating } from '@lib/elo';

// In-memory queue: { userId, socketId, elo, timeControl }
const queue = [];

/**
 * Add a user to the matchmaking queue
 */
export const addToQueue = async (socket, timeControl) => {
  const userId = socket.user._id.toString();

  // Check if user already in queue
  const existingIndex = queue.findIndex((entry) => entry.userId === userId);
  if (existingIndex !== -1) {
    queue.splice(existingIndex, 1);
  }

  // Fetch user's current ELO
  const user = await Identity.findById(userId).select('elo name').lean();
  if (!user) {
    return null;
  }

  const entry = {
    userId,
    socketId: socket.id,
    elo: user.elo || 1200,
    name: user.name,
    timeControl,
    joinedAt: Date.now(),
  };

  queue.push(entry);
  console.log(`User ${user.name} (${user.elo}) joined queue. Queue size: ${queue.length}`);

  return entry;
};

/**
 * Remove a user from the queue
 */
export const removeFromQueue = (userId) => {
  const index = queue.findIndex((entry) => entry.userId === userId);
  if (index !== -1) {
    const removed = queue.splice(index, 1)[0];
    console.log(`User ${removed.name} left queue. Queue size: ${queue.length}`);
    return removed;
  }
  return null;
};

/**
 * Find a match for a user in the queue
 * Returns [player1, player2] if match found, null otherwise
 */
export const findMatch = (playerEntry) => {
  const ELO_RANGE = 200;

  // Find opponents with similar ELO and same time control
  const potentialOpponents = queue.filter((entry) => {
    if (entry.userId === playerEntry.userId) return false;
    if (entry.timeControl.initial !== playerEntry.timeControl.initial) return false;
    if (entry.timeControl.increment !== playerEntry.timeControl.increment) return false;

    const eloDiff = Math.abs(entry.elo - playerEntry.elo);
    return eloDiff <= ELO_RANGE;
  });

  if (potentialOpponents.length === 0) {
    return null;
  }

  // Pick the closest ELO match
  potentialOpponents.sort((a, b) => {
    const diffA = Math.abs(a.elo - playerEntry.elo);
    const diffB = Math.abs(b.elo - playerEntry.elo);
    return diffA - diffB;
  });

  const opponent = potentialOpponents[0];

  // Remove both from queue
  removeFromQueue(playerEntry.userId);
  removeFromQueue(opponent.userId);

  // Randomly assign colors
  const whitePlayerEntry = Math.random() < 0.5 ? playerEntry : opponent;
  const blackPlayerEntry = whitePlayerEntry === playerEntry ? opponent : playerEntry;

  return { whitePlayerEntry, blackPlayerEntry };
};

/**
 * Create a new live game in the database
 */
export const createLiveGame = async (whitePlayerEntry, blackPlayerEntry) => {
  const game = await Game.create({
    type: 'live',
    whitePlayer: whitePlayerEntry.userId,
    blackPlayer: blackPlayerEntry.userId,
    white: whitePlayerEntry.name,
    black: blackPlayerEntry.name,
    status: 'active',
    result: '*',
    moves: 0,
    pgn: '',
    opening: 'Starting position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    uciMoves: [],
    timeControl: whitePlayerEntry.timeControl,
    whiteTimeRemaining: whitePlayerEntry.timeControl.initial * 1000,
    blackTimeRemaining: blackPlayerEntry.timeControl.initial * 1000,
  });

  return game;
};

/**
 * Update ELO ratings after a game
 */
export const updateEloRatings = async (gameId) => {
  const game = await Game.findById(gameId)
    .populate('whitePlayer', 'elo')
    .populate('blackPlayer', 'elo')
    .lean();

  if (!game || game.type !== 'live' || game.status !== 'completed') {
    return;
  }

  const whitePlayer = game.whitePlayer;
  const blackPlayer = game.blackPlayer;

  let whiteScore, blackScore;
  if (game.result === '1-0') {
    whiteScore = 1;
    blackScore = 0;
  } else if (game.result === '0-1') {
    whiteScore = 0;
    blackScore = 1;
  } else if (game.result === '1/2-1/2') {
    whiteScore = 0.5;
    blackScore = 0.5;
  } else {
    return; // No result yet or aborted
  }

  const newWhiteElo = calculateNewRating(whitePlayer.elo, blackPlayer.elo, whiteScore);
  const newBlackElo = calculateNewRating(blackPlayer.elo, whitePlayer.elo, blackScore);

  await Identity.findByIdAndUpdate(whitePlayer._id, { elo: newWhiteElo });
  await Identity.findByIdAndUpdate(blackPlayer._id, { elo: newBlackElo });

  console.log(
    `ELO updated: ${whitePlayer._id} ${whitePlayer.elo} → ${newWhiteElo}, ${blackPlayer._id} ${blackPlayer.elo} → ${newBlackElo}`
  );
};

/**
 * Get current queue status
 */
export const getQueueStatus = () => {
  return {
    size: queue.length,
    entries: queue.map((e) => ({ userId: e.userId, elo: e.elo, timeControl: e.timeControl })),
  };
};
