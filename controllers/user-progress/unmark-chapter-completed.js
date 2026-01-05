import { error } from '@functions';
import { CourseProgress, Study } from '@models';

export default async (req, res) => {
  const { chapterId } = req.params;
  const { me } = req.user;

  if (!me || !chapterId) {
    throw error(400, 'Missing required params');
  }

  // Find the study that contains the given chapterId within the 'chapters' array
  const study = await Study.findOne({ 'chapters._id': chapterId });
  if (!study) {
    throw error(404, 'Study not found for this chapter');
  }

  // Find the course associated with this study
  const courseId = study.course;

  // Find and update the UserProgress document for the user and the course
  const userProgress = await CourseProgress.findOneAndUpdate(
    { user: me, course: courseId }, // Find progress for the current user
    { $pull: { completedChapters: chapterId } } // Remove the chapterId from completedChapters
  );

  if (!userProgress) {
    throw error(404, 'Progress record not found');
  }

  return res.status(200).json({
    message: 'Chapter unmarked successfully',
    data: userProgress.completedChapters,
  });
};
