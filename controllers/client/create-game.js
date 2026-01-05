import { error } from '@functions';
import { Game, Identity } from '@models';

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

  return res.status(201).json({
    data: game,
  });
};
