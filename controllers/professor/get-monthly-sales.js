import { error } from '@functions';
import { Course, Order } from '@models';
import { startOfYear, endOfYear, format, getMonth } from 'date-fns';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const professorCourseIds = await Course.find({ createdBy: me }).distinct('_id');
  const now = new Date();

  const orders = await Order.find({
    course: { $in: professorCourseIds },
    createdAt: { $gte: startOfYear(now), $lte: endOfYear(now) },
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    primary: format(new Date(now.getFullYear(), i), 'MMMM'),
    secondary: 0,
  }));

  orders.forEach((order) => {
    const month = getMonth(order.createdAt);
    monthlyData[month].secondary += 1;
  });

  return res.json(monthlyData);
};
