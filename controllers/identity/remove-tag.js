import { error } from '@functions';
import { Tag, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(400, 'Missing required params');
  }

  const { id } = req.params;
  if (!id) {
    throw error(400, 'Tag ID is required');
  }

  const tag = await Tag.findOne({
    _id: id,
    'user._id': me,
  });

  if (!tag) {
    throw error(404, 'Tag not found');
  }

  // Remove the tag from all studies that reference it
  await Study.updateMany({ 'client._id': me, 'tags._id': id }, { $pull: { tags: { _id: id } } });

  await Tag.findByIdAndDelete(id);

  // Return empty message to prevent toaster popup on frontend
  return res.status(200).json({
    message: '',
  });
};
