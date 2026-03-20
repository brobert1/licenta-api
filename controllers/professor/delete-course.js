import { error } from '@functions';
import { cleanupFileFromPath } from '@functions/cleanup-files';
import { Course } from '@models';

export default async (req, res) => {
  const { id } = req.params;
  const { me } = req.user;

  if (!id || !me) {
    throw error(404, 'Missing required params');
  }

  const course = await Course.findById(id);
  if (!course) {
    throw error(404, 'Course not found');
  }
  if (String(course.createdBy) !== String(me)) {
    throw error(403, 'Access denied');
  }

  const filesToRemove = [];

  if (course?.image.path) {
    filesToRemove.push({ path: course.image?.path });
  }

  if (filesToRemove.length > 0) {
    await Promise.all(filesToRemove.map((file) => cleanupFileFromPath(file.path)));
  }

  await course.deleteOne();

  return res.status(200).json({
    data: course,
    message: 'Course deleted successfully',
  });
};
