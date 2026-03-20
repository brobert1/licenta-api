import { error } from '@functions';
import { Chapter, Course, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;
  if (!me || !id) {
    throw error(404, 'Missing required params');
  }

  const study = await Study.findOne({
    _id: id,
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  })
    .populate('course')
    .lean();

  if (!study) {
    throw error(404, 'Resource not found');
  }

  const isOwnStudy = String(study.author) === String(me);
  const isCourseStudy =
    study.course && String(study.course.createdBy) === String(me);

  if (!isOwnStudy && !isCourseStudy) {
    throw error(403, 'Access denied');
  }

  const chapterIds = study.chapters.map((c) => c._id);

  const chapterDocs = await Chapter.find({ _id: { $in: chapterIds } })
    .sort({ index: 1 })
    .lean();

  study.chapters = chapterDocs;

  const progress = { completedChapters: [] };

  return res.status(200).json({ study, progress });
};
