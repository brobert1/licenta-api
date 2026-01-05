import { error } from '@functions';
import { Study, Chapter } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;
  if (!me || !id) {
    throw error(404, 'Missing required params');
  }

  const study = await Study.findOne({
    'author._id': me,
    _id: id,
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  }).lean();

  if (!study) {
    throw error(404, 'Resource not found');
  }

  const chapterIds = study.chapters.map((c) => c._id);

  const chapterDocs = await Chapter.find({ _id: { $in: chapterIds } })
    .sort({ index: 1 })
    .lean();

  study.chapters = chapterDocs;

  return res.status(200).json(study);
};
