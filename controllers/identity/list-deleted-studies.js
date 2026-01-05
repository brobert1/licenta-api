import { error } from '@functions';
import { trash as Trash } from 'express-goodies/mongoose';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const trashedItems = await Trash.find({
    type: 'study',
    'user._id': me,
  })
    .sort({ createdAt: -1 })
    .lean();

  const studies = trashedItems.map((item) => {
    const studyData = JSON.parse(item.data);
    return {
      ...studyData,
      _id: item._id,
      deletedAt: item.createdAt,
    };
  });

  return res.status(200).json({ data: studies });
};
