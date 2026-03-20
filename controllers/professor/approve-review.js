import { error } from 'express-goodies/functions';
import { Course, Review } from '@models';

export default async (req, res) => {
  const { id } = req.params;
  const { me } = req.user;
  if (!id) {
    throw error(400, 'Review ID is required');
  }

  const review = await Review.findById(id).populate('course').lean();
  if (!review) {
    throw error(404, 'Review not found');
  }
  if (String(review.course?.createdBy) !== String(me)) {
    throw error(403, 'Access denied');
  }

  await Review.findByIdAndUpdate(id, { approved: true });

  return res.status(200).json({
    data: review,
    message: 'The review was successfully approved',
  });
};
