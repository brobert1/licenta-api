import { error } from '@functions';
import { Chapter, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;
  if (!me || !id) {
    throw error(404, 'Missing required params');
  }

  const originalStudy = await Study.findOne({
    'author._id': me,
    _id: id,
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  }).lean();

  if (!originalStudy) {
    throw error(404, 'Resource not found');
  }

  const originalChapterIds = originalStudy.chapters.map((c) => c._id);
  const originalChapters = await Chapter.find({
    _id: { $in: originalChapterIds },
  })
    .sort({ index: 1 })
    .lean();

  const clonedStudy = await Study.create({
    author: originalStudy.author,
    name: originalStudy.name,
    icon: originalStudy.icon,
    color: originalStudy.color,
    tags: originalStudy.tags || [],
    chapters: [],
  });

  const chaptersToCreate = originalChapters.map((originalChapter) => ({
    study: clonedStudy,
    name: originalChapter.name,
    index: originalChapter.index,
    pgn: originalChapter.pgn,
    fen: originalChapter.fen,
    variant: originalChapter.variant,
    orientation: originalChapter.orientation,
    analysis: originalChapter.analysis,
  }));

  const clonedChapters = await Chapter.insertMany(chaptersToCreate);

  await Study.findByIdAndUpdate(
    clonedStudy._id,
    {
      chapters: clonedChapters.map((chapter) => ({
        _id: chapter._id,
        name: chapter.name,
      })),
    }
  );

  const finalStudy = await Study.findById(clonedStudy._id).lean();

  return res.status(201).json({
    data: finalStudy,
    message: 'Study cloned successfully',
  });
};
