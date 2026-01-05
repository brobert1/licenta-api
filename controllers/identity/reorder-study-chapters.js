import { error } from '@functions';
import { Chapter, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { studyId, chapters } = req.body;
  if (!studyId || !chapters || !Array.isArray(chapters)) {
    throw error(400, 'Invalid request data');
  }

  const study = await Study.findOne({ _id: studyId, 'author._id': me });
  if (!study) {
    throw error(404, 'Study not found');
  }

  const updatedChapters = [];

  for (const { id, index } of chapters) {
    const updated = await Chapter.findOneAndUpdate(
      { _id: id, 'study._id': studyId },
      { index }
    );
    updatedChapters.push(updated);
  }

  return res.status(200).json({
    data: updatedChapters,
    message: '',
  });
};
