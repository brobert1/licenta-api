import { error } from '@functions';
import { Chapter } from '@models';
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

  const studyData = JSON.parse(trashEntry.data);
  const originalStudyId = studyData._id;

  // Delete all chapters associated with this study
  await Chapter.deleteMany({ 'study._id': originalStudyId });

  await Trash.findByIdAndDelete(id);

  return res.status(200).json({
    message: 'Study deleted',
  });
};
