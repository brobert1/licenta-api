import { error } from '@functions';
import { Identity, Tag } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(400, 'Missing required params');
  }

  const user = await Identity.findById(me);
  if (!user) {
    throw error(404, 'User not found');
  }

  const { name } = req.body;
  if (!name) {
    throw error(400, 'Tag name is required');
  }

  const tag = await Tag.create({
    user,
    name,
  });

  // Return empty message to prevent toaster popup on frontend
  return res.status(201).json({
    data: tag,
    message: '',
  });
};
