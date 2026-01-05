import { error } from '@functions';
import { Review } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const reviews = await Review.find({ approved: false }).populate('user course').paginate(req.query);
  if (!reviews) {
    throw error(404, 'Resource not found');
  }
  const { page, perPage } = reviews.pageParams;
  reviews.pages.forEach((document, index) => {
    document.no = (page - 1) * perPage + index + 1;
  });

  return res.status(200).json(reviews);
};
