/**
 * Builds an aggregation pipeline to fetch course details, related lessons, reviews, and related courses.
 * @param {string} courseId - The ID of the course to retrieve.
 * @param {Array} userCompletedChapters - List of chapter IDs the user has completed.
 * @param {string} userId - The ID of the current user.
 * @returns {Array} Aggregation pipeline for querying course data.
 */
export default function buildCoursePipeline(courseId, userCompletedChapters, userId) {
  return [
    {
      $match: {
        _id: courseId,
      },
    },
    {
      $lookup: {
        from: 'lessons',
        let: { lessonIds: '$lessons._id' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$lessonIds'] },
            },
          },
          {
            $addFields: {
              completedChapters: {
                $size: {
                  $filter: {
                    input: '$chapters',
                    as: 'chapter',
                    cond: { $in: ['$$chapter._id', userCompletedChapters] },
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              isFree: 1,
              chapters: 1,
              completedChapters: 1,
            },
          },
        ],
        as: 'lessons',
      },
    },
    {
      $lookup: {
        from: 'courses',
        let: { courseDifficulty: '$difficulty', courseId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$difficulty', '$$courseDifficulty'] },
                  { $ne: ['$_id', '$$courseId'] },
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
              image: 1,
              lessons: 1,
            },
          },
        ],
        as: 'relatedCourses',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        let: { reviewIds: '$reviews._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $in: ['$_id', '$$reviewIds'] }, { $ne: ['$user', userId] }],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: 'identities',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              rating: 1,
              name: 1,
              review: 1,
              createdAt: 1,
              user: { _id: '$user._id', name: '$user.name', image: '$user.image' },
            },
          },
        ],
        as: 'reviews',
      },
    },
  ];
}
