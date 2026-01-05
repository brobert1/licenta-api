import { error } from '@functions';
import { courseFilters } from '@functions/filters';
import { Course, Order } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const filters = courseFilters(req.query);

  const [courses, userOrders] = await Promise.all([
    Course.find(filters).paginate(req.query),
    Order.find({ identity: me }).lean(),
  ]);

  if (!courses) {
    throw error(404, 'Resource not found');
  }

  const userOrderCourseIds = new Set(userOrders.map((order) => order.course.toString()));

  // Add 'isOwned' flag
  courses.pages.forEach((course) => {
    course.isOwned = userOrderCourseIds.has(course._id.toString());
  });

  return res.status(200).json(courses);
};
