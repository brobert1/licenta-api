import { error, uploadFiles } from '@functions';
import { cleanupFiles } from '@functions/cleanup-files';
import { Identity } from '@models';
import { getKey } from '@plugins/aws/src';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const identity = await Identity.findById(me).lean();
  if (!identity) {
    throw error(404, 'The account was not found.');
  }
  const keys = [];
  const previousImagePath = identity?.image?.path;
  const updatedImageFromFiles = req.files?.image;

  let updatedImage = null;

  if (updatedImageFromFiles) {
    if (previousImagePath) {
      await cleanupFiles([getKey(previousImagePath)]);
    }
    [updatedImage] = await uploadFiles([updatedImageFromFiles], keys);
  } else if (previousImagePath) {
    await cleanupFiles([getKey(previousImagePath)]);
  }

  await Identity.findByIdAndUpdate(me, { image: updatedImage || null });

  return res.status(200).json({
    data: identity,
    message: 'Image uploaded successfully',
  });
};
