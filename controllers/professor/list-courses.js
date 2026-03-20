import { error } from '@functions';
import { Course, Progress } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const courses = await Course.find({ createdBy: me }).paginate(req.query);
  if (!courses) {
    throw error(404, 'Resource not found');
  }
  const { page, perPage } = courses.pageParams;

  const countPromises = courses.pages.map(async (document, index) => {
    document.no = (page - 1) * perPage + index + 1;
    document.countLessons = document.content
      ? document.content.filter((item) => item.kind === 'study').length
      : 0;
    document.countEnrolledClients = await Progress.countDocuments({ course: document._id });
    return document;
  });

  courses.pages = await Promise.all(countPromises);

  return res.status(200).json(courses);
};
