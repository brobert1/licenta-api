import { error } from '@functions';
import { Game } from '@models';

export default async (req, res) => {
  const { id } = req.params;
  const { me } = req.user;

  if (!id || !me) {
    throw error(400, 'Missing required params');
  }

  const game = await Game.findOne({
    _id: id,
    $or: [{ user: me }, { whitePlayer: me }, { blackPlayer: me }],
  });

  if (!game) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(game);
};
