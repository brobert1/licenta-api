import { error } from '@functions';
import { Game } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const games = await Game.find({
    $or: [{ user: me }, { whitePlayer: me }, { blackPlayer: me }],
    status: { $ne: 'active' },
  }).sort({ createdAt: -1 });

  if (!games) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(games);
};
