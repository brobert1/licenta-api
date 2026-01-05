import { error } from 'express-goodies/functions';
import { Review } from '../../models';

export default async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw error(400, 'Review ID is required');
  }

  const review = await Review.findById(id).lean();
  if (!review) {
    throw error(404, 'Review not found');
  }

  // Mark review as approved
  await Review.findByIdAndUpdate(id, { approved: true });

  return res.status(200).json({
    data: review,
    message: 'The review was successfully approved',
  });
};
