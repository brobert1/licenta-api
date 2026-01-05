import { error } from '@functions';
import { Course, Study } from '@models';

export default async (req, res) => {
  const { id } = req.params;
  const { me } = req.user;
  if (!id || !me) {
    throw error(404, 'Missing required params');
  }

  const course = await Course.findById(id).select('-preview').lean();
  if (!course) {
    throw error(404, 'Resource not found');
  }

  // Populate content with study details (like client endpoint)
  const populatedContent = await Promise.all(
    (course.content || [])
      .filter((item) => item.kind === 'study')
      .map(async (item) => {
        const doc = await Study.findById(item._id).lean();
        return { ...doc, kind: 'study', index: item.index, completedChapters: 0 };
      })
  );

  course.content = populatedContent.filter(Boolean);

  return res.status(200).json(course);
};
