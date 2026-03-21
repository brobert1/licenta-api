import { error } from '@functions';
import { Chapter, Course, CourseProgress, Order } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) throw error(404, 'Missing required params');

  const orders = await Order.find({ identity: me }).lean();
  const enrolledCourseIds = orders.map((o) => o.course);

  if (!enrolledCourseIds.length) {
    return res.status(200).json([]);
  }

  const courses = await Course.find({
    _id: { $in: enrolledCourseIds },
    active: true,
  }).lean();

  const result = await Promise.all(
    courses.map(async (course) => {
      const studyIds = (course.content || []).map((c) => c._id);

      const [totalChapters, progress] = await Promise.all([
        studyIds.length
          ? Chapter.countDocuments({ study: { $in: studyIds } })
          : Promise.resolve(0),
        CourseProgress.findOne({ user: me, course: course._id }).lean(),
      ]);

      const completedChapters = progress?.completedChapters?.length || 0;

      return {
        _id: course._id,
        name: course.name,
        image: course.image,
        difficulty: course.difficulty,
        completedChapters,
        totalChapters,
        percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
      };
    })
  );

  return res.status(200).json(result);
};
