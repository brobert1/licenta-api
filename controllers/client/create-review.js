import { error } from '@functions';
import { Course, Identity, Review } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  // Check if user and course exist
  const user = await Identity.findById(me).lean();
  if (!user) {
    throw error(404, 'User not found');
  }
  const { courseId } = req.body;
  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw error(404, 'Course not found');
  }

  // Create a new review
  const review = await Review.create({ ...req.body, user, course });
  if (!review) {
    throw error(400, 'Could not create your review');
  }

  return res.status(200).json({
    data: review,
    message: 'Your review needs admin moderation before it can be published',
  });
};
