import { error } from '@functions';
import { Chapter, DrillProgress } from '@models';

export default async (req, res) => {
  const { chapterId } = req.params;
  const { me } = req.user;

  if (!me || !chapterId) {
    throw error(400, 'Missing required params');
  }

  const chapter = await Chapter.findById(chapterId).lean();
  if (!chapter) {
    throw error(404, 'Chapter not found');
  }

  if (chapter.analysis !== 'drill') {
    throw error(400, 'Chapter is not a drill chapter');
  }

  // Save the drill progress for this chapter
  const drillProgress = await DrillProgress.create({
    user: me,
    chapter: chapter._id,
    ...req.body,
  });

  return res.status(200).json({
    message: 'Chapter drill progress saved successfully',
    data: drillProgress,
  });
};
