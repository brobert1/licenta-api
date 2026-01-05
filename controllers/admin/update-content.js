import { error } from 'express-goodies/mongoose';
import { Course } from '@models';
import { isEmpty } from 'lodash';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { content, courseId } = req.body;
  if (!courseId || !Array.isArray(content)) {
    throw error(400, 'Invalid request data');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw error(404, 'Course not found');
  }

  // Only allow studies to be reordered/updated
  const validItems = content.filter(
    (item) => item._id && item.kind === 'study' && typeof item.index === 'number'
  );
  if (isEmpty(validItems)) {
    throw error(400, 'No valid study items to update');
  }

  course.content = validItems
    .slice()
    .sort((a, b) => a.index - b.index)
    .map(({ kind, _id, name, index }) => ({ kind, _id, name, index }));

  await course.save();

  return res.status(200).json({
    data: course,
    message: 'Content order updated successfully',
  });
};
