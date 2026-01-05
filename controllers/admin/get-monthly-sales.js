import { error } from '@functions';
import { Order } from '@models';
import { startOfYear, endOfYear, format, getMonth } from 'date-fns';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const now = new Date();

  const orders = await Order.find({
    createdAt: { $gte: startOfYear(now), $lte: endOfYear(now) },
  });

  // Initialize an array for each month using the current year for formatting month names
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
