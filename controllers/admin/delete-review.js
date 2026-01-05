import { Review } from '@models';
import { error } from 'express-goodies/functions';

export default async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw error(400, 'Review ID is requred');
  }

  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw error(404, 'Review not found');
  }

  await review.deleteOne();

  return res.status(200).json({
    data: review,
    message: 'The review was successfully deleted',
  });
};
