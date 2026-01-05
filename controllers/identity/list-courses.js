import { error } from '@functions';
import { Course } from '@models';

export default async (req, res) => {
  const courses = await Course.find({}).paginate(req.query);
  if (!courses) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(courses);
};
