import { Study } from '@models';

export default async (req, res) => {
  const studies = await Study.find({
    course: { $exists: false },
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(studies);
};
