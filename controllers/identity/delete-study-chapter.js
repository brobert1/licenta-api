import { error } from '@functions';
import { Chapter, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { id: chapterId } = req.params;

  const chapter = await Chapter.findById(chapterId).lean();
  if (!chapter) {
    throw error(404, 'Chapter not found');
  }

  await Chapter.findByIdAndDelete(chapterId);

  await Study.findByIdAndUpdate(chapter.study._id, {
    $pull: { chapters: { _id: chapterId } },
  });

  // Reorder remaining chapters' indices to keep them contiguous
  const remainingChapters = await Chapter.find({ 'study._id': chapter.study._id })
    .sort({ index: 1 })
    .select('_id')
    .lean();

  if (remainingChapters.length > 0) {
    const bulkOps = remainingChapters.map((c, idx) => ({
      updateOne: {
        filter: { _id: c._id },
        update: { index: idx },
      },
    }));
    await Chapter.bulkWrite(bulkOps);
  }

  return res.status(200).json({
    message: 'Chapter deleted successfully',
  });
};
