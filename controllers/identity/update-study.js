import { error } from '@functions';
import { Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;
  if (!me || !id) {
    throw error(404, 'Missing required params');
  }

  const { name, tags, active } = req.body;

  if (!name && !tags) {
    throw error(400, 'Name or tags are required.');
  }

  const study = await Study.findOne({ _id: id, 'author._id': me });
  if (!study) {
    throw error(404, 'Study not found');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (tags) updateData.tags = tags;
  if (active !== undefined) updateData.active = active;

  const updatedStudy = await Study.findByIdAndUpdate(id, updateData);

  return res.status(200).json({
    data: updatedStudy,
    message: 'Study updated successfully',
  });
};
