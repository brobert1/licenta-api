import { error } from '@functions';
import { Tag } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const tags = await Tag.find({ 'user._id': me });

  if (!tags) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(tags);
};
