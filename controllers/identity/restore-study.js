import { error } from '@functions';
import { Study } from '@models';
import { trash as Trash } from 'express-goodies/mongoose';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;

  if (!me || !id) {
    throw error(404, 'Missing required params');
  }

  const trashEntry = await Trash.findOne({
    _id: id,
    type: 'study',
    'user._id': me,
  });

  if (!trashEntry) {
    throw error(404, 'Study not found in trash');
  }

  // Recreate the study document
  const restoredStudy = await Study.create(JSON.parse(trashEntry.data));

  await Trash.findByIdAndDelete(id);

  return res.status(200).json({
    data: restoredStudy,
    message: 'Study restored successfully',
  });
};
