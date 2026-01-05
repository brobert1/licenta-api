import { calculateRate, error } from '@functions';
import { gameStatsFilters } from '@functions/filters';
import { Game } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const filters = gameStatsFilters(req.query, me, req.user.name);

  const games = await Game.find(filters);

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
    if (game.result === req.user.name) {
      stats.wins++;
    } else if (game.result === 'Draw') {
      stats.draws++;
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
