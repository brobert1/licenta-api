import { error } from '@functions';
import { Client, CourseProgress, Study } from '@models';

export default async (req, res) => {
  const { chapterId } = req.params;
  const { me } = req.user;

  if (!me || !chapterId) {
    throw error(400, 'Missing required params');
  }

  // Find the client by their ID
  const client = await Client.findById(me);
  if (!client) {
    throw error(404, 'Client not found');
  }

  // Find the study that contains the given chapterId within the 'chapters' array
  const study = await Study.findOne({ 'chapters._id': chapterId });
  if (!study) {
    throw error(404, 'Study not found for this chapter');
  }

  // Find the course associated with this study
  const courseId = study.course;

  // Fetch or create a UserProgress document for the current user and course
  let userProgress = await CourseProgress.findOne({ user: client._id, course: courseId });
  if (!userProgress) {
    userProgress = new CourseProgress({
      user: client._id,
      course: courseId,
      completedChapters: [],
    });
  }

  // Check if the chapter is already marked as completed
  const isChapterCompleted = userProgress.completedChapters.some(
    (completedChapterId) => completedChapterId.toString() === chapterId
  );

  if (!isChapterCompleted) {
    // Add the chapter to the list of completed chapters
    userProgress.completedChapters.push(chapterId);

    await userProgress.save();
  }

  return res.status(200).json({
    message: 'Chapter marked as completed',
    data: userProgress.completedChapters,
  });
};
