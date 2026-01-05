import { error } from '@functions';
import { Course, Order } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const userOrders = await Order.find({ identity: me }).lean();

  const enrolledCourseIds = userOrders.map((order) => order.course);

  const courses = await Course.find({
    _id: { $in: enrolledCourseIds },
    active: true,
  }).paginate(req.query);

  if (!courses) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(courses);
};
