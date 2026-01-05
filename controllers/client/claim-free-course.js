import { error } from '@functions';
import { Course, Order } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  const { id } = req.params;
  if (!id || !me) {
    throw error(404, 'Missing required params');
  }

  const course = await Course.findById(id).select('isPaid active currency').lean();

  if (!course) {
    throw error(404, 'Course not found');
  }
  if (!course.active) {
    throw error(400, 'Cannot claim an inactive course');
  }
  if (course.isPaid) {
    throw error(400, 'This course requires payment');
  }

  // Check if user already has an order for this course
  const existingOrder = await Order.findOne({ course: id, identity: me }).lean();
  if (existingOrder) {
    throw error(400, 'You already have access to this course');
  }

  // Create a free order (amount: 0)
  const order = await Order.create({
    course: id,
    identity: me,
    amount: 0,
    currency: course.currency || 'EUR',
  });

  return res.status(201).json({
    message: 'Course claimed successfully',
    order,
  });
};
