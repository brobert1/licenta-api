import { error } from '@functions';
import { Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;

  if (!me || !id) {
    throw error(404, 'Missing required params');
  }

  const study = await Study.findOne({ _id: id, 'author._id': me });
  if (!study) {
    throw error(404, 'Study not found');
  }

  await Study.findByIdAndDelete(id);

  return res.status(200).json({
    message: 'Study moved to trash',
  });
};
