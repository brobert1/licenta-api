import { error } from '@functions';
import { DailyStats, Game, Identity } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(400, 'Missing required params');
  }

  const user = await Identity.findById(me).lean();
  if (!user) {
    throw error(404, 'User not found');
  }

  const { pgn, moves, white, black, result, opening } = req.body;

  const game = await Game.create({
    user,
    type: 'bot',
    white,
    black,
    result,
    moves,
    pgn,
    opening,
  });

  if (!game) {
    throw error(400, 'Could not save game');
  }

  // Update daily stats for bot game (no ELO change)
  const isWhite = white === user.name;
  const inc = {};
  if (result === '1-0') inc[isWhite ? 'wins' : 'losses'] = 1;
  else if (result === '0-1') inc[isWhite ? 'losses' : 'wins'] = 1;
  else inc.draws = 1;

  const date = new Date().toISOString().slice(0, 10);
  await DailyStats.findOneAndUpdate(
    { user: me, date },
    { $inc: inc },
    { upsert: true }
  );

  return res.status(201).json({
    data: game,
  });
};
