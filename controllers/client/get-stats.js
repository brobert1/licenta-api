import { calculateRate, error } from '@functions';
import { Game } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  // Build query
  const query = {
    $or: [{ user: me }, { whitePlayer: me }, { blackPlayer: me }],
    status: { $ne: 'active' }, // Exclude active games
  };

  // Filter by type
  if (req.query.type === 'bot') {
    query.type = 'bot';
  } else if (req.query.type === 'live') {
    query.type = 'live';
  }

  // Filter by color
  if (req.query.color === 'white') {
    query.$or = [{ user: me, white: req.user.name }, { whitePlayer: me }];
  } else if (req.query.color === 'black') {
    query.$or = [{ user: me, black: req.user.name }, { blackPlayer: me }];
  }

  const games = await Game.find(query);

  if (!games) {
    throw error(404, 'Resource not found');
  }

  let stats = {
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
  };

  games.forEach((game) => {
    stats.games++;

    // Determine user's color in this game
    let isWhite = false;
    if (game.type === 'bot') {
      isWhite = game.white === req.user.name;
    } else {
      isWhite = game.whitePlayer?.toString() === me;
    }

    // Calculate result
    let userWon = false;
    let isDraw = false;

    if (game.result === '1-0') {
      userWon = isWhite;
    } else if (game.result === '0-1') {
      userWon = !isWhite;
    } else if (game.result === '1/2-1/2') {
      isDraw = true;
    } else if (game.result === 'Draw') { // Legacy support
      isDraw = true;
    } else if (game.result === req.user.name) { // Legacy support for bot games
      userWon = true;
    }

    if (isDraw) {
      stats.draws++;
    } else if (userWon) {
      stats.wins++;
    } else {
      stats.losses++;
    }
  });

  // Calculate rates
  stats.winRate = calculateRate(stats.wins, stats.games);
  stats.drawRate = calculateRate(stats.draws, stats.games);
  stats.lossRate = calculateRate(stats.losses, stats.games);

  return res.status(200).json(stats);
};
