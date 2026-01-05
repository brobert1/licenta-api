import { error } from '@functions';
import { cleanupFileFromPath } from '@functions/cleanup-files';
import { Identity } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const identity = await Identity.findById(me).lean();
  if (!identity) {
    throw error(404, 'The account was not found.');
  }

  if (identity?.image?.path) {
    await cleanupFileFromPath(identity.image.path);
  }

  await Identity.findByIdAndUpdate(me, { image: null });

  return res.status(200).json({
    data: identity,
    message: 'Image removed successfully.',
  });
};
