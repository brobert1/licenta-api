import { Course, Review } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    return res.json(0);
  }

  const professorCourseIds = await Course.find({ createdBy: me }).distinct('_id');
  const count = await Review.countDocuments({
    approved: false,
    course: { $in: professorCourseIds },
  });

  return res.json(count);
};
