import { error } from '@functions';
import { Course, Order } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const professorCourseIds = await Course.find({ createdBy: me }).distinct('_id');
  const orders = await Order.find({ course: { $in: professorCourseIds } })
    .populate('course identity')
    .paginate(req.query);

  if (!orders) {
    throw error(404, 'Resource not found');
  }
  const { page, perPage } = orders.pageParams;
  orders.pages.forEach((document, index) => {
    document.no = (page - 1) * perPage + index + 1;
  });

  return res.status(200).json(orders);
};
