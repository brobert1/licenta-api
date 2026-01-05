import { error } from '@functions';
import { Course, Order, Progress, Review, Study } from '@models';
import { meanBy } from 'lodash';

export default async (req, res) => {
  const { id } = req.params;
  const { me } = req.user;
  if (!id || !me) {
    throw error(404, 'Missing required params');
  }

  const course = await Course.findById(id).lean();
  if (!course?.active) {
    throw error(404, 'Resource not found');
  }

  const courseProgress = (await Progress.findOne({ user: me, course: course._id }).lean()) || {};
  const doneChapters = new Set((courseProgress.completedChapters || []).map(String));

  const populatedContent = await Promise.all(
    (course.content || [])
      .filter((item) => item.kind === 'study')
      .map(async (item) => {
        const doc = await Study.findById(item._id).lean();
        // Skip inactive studies for clients
        if (!doc || doc.active === false) {
          return null;
        }
        const chapters = Array.isArray(doc?.chapters) ? doc.chapters : [];
        const completedChapters = chapters.filter((chapter) =>
          doneChapters.has(chapter._id.toString())
        ).length;
        return { ...doc, kind: 'study', index: item.index, completedChapters };
      })
  );

  course.content = populatedContent.filter(Boolean);

  const userReview = await Review.findOne({ 'course._id': id, user: me }).populate('user').lean();
  let reviews = await Review.find({ 'course._id': id }).populate('user').lean();

  const isReviewer = Boolean(userReview);
  if (userReview) {
    reviews = reviews.filter((r) => r._id.toString() !== userReview._id.toString());
  }
  course.reviews = reviews;
  course.rating = Number(meanBy(reviews, 'rating') || 0).toFixed(2);

  const order = await Order.findOne({ course: id, identity: me }).lean();
  const isOwned = Boolean(order);

  const user = {
    _id: me,
    isReviewer,
    review: userReview,
    isOwned,
  };

  return res.status(200).json({ course, user });
};
