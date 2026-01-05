import { Course } from '@models';

export default async (req, res) => {
  const now = new Date();

  const saleCount = await Course.countDocuments({
    active: true,
    'sale.isActive': true,
    isPaid: true,
    'sale.price': { $gt: 0 },
    $or: [{ 'sale.endsAt': { $gt: now } }, { 'sale.endsAt': null }],
  });

  const hasSale = saleCount > 0;

  return res.status(200).json({ hasSale, count: saleCount });
};
