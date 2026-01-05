import { error } from '@functions';
import { Order } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const orders = await Order.find({ identity: me }).populate('course').paginate(req.query);
  if (!orders) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(orders);
};
