import { Review } from "@models";

export default async (req, res) => {
  const unsolvedReviewsCount = await Review.countDocuments({ approved: false }).exec();

  return res.json(unsolvedReviewsCount);
};
