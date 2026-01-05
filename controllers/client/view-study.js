import { error } from '@functions';
import { Chapter, Course, CourseProgress, Order, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;
  if (!me || !id) {
    throw error(404, 'Missing required params');
  }

  const study = await Study.findOne({
    _id: id,
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  }).lean();

  if (!study) {
    throw error(404, 'Resource not found');
  }

  if (study.course) {
    const course = await Course.findById(study.course).lean();

    if (!course) {
      throw error(404, 'Course not found');
    }

    if (course.isPaid) {
      const order = await Order.findOne({
        identity: me,
        course: study.course,
      }).lean();

      if (!order) {
        throw error(403, 'Access denied. Purchase required to view this content.');
      }
    }
  } else {
    if (!study.author.equals(me)) {
      throw error(403, 'Access denied. You can only view your own studies.');
    }
  }

  const chapterIds = study.chapters.map((c) => c._id);

  const chapterDocs = await Chapter.find({ _id: { $in: chapterIds } })
    .sort({ index: 1 })
    .lean();

  study.chapters = chapterDocs;

  let progress = { completedChapters: [] };
  if (study.course) {
    const courseProgress = await CourseProgress.findOne({
      user: me,
      course: study.course,
    }).lean();

    if (courseProgress) {
      progress.completedChapters = courseProgress.completedChapters.map((id) => id.toString());
    }
  }

  return res.status(200).json({ study, progress });
};
