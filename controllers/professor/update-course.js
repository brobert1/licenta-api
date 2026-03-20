import { error, uploadFiles } from '@functions';
import { cleanupFiles } from '@functions/cleanup-files';
import { Course } from '@models';
import { getKey } from '@plugins/aws/src';

export default async (req, res) => {
  const document = await Course.findById(req.params.id);
  if (!document) {
    throw error(404, 'Error! The course was not found.');
  }
  if (String(document.createdBy) !== String(req.user.me)) {
    throw error(403, 'Access denied');
  }

  const keys = [];
  try {
    const payload = req.body;

    const payloadImage = payload?.image;
    const previousImagePath = document?.image?.path;
    const updatedImageFromFiles = req.files?.image;

    if (updatedImageFromFiles) {
      if (previousImagePath) {
        await cleanupFiles([getKey(previousImagePath)]);
      }
      const [updatedImage] = await uploadFiles([updatedImageFromFiles], keys);

      payload.image = updatedImage;
      document.preview.image = updatedImage;
    } else if (!payloadImage) {
      if (previousImagePath) {
        await cleanupFiles([getKey(previousImagePath)]);
      }
      payload.image = null;
      document.preview.image = null;
    } else {
      delete payload.image;
    }

    if (payload?.isPaid === false) {
      delete payload.price;
      delete payload.currency;
      delete payload.sale;
      await document.updateOne({
        $set: payload,
        $unset: { price: 1, currency: 1, sale: 1 },
      });
    } else if (payload?.sale?.isActive === false) {
      delete payload.sale;
      await document.updateOne({ $set: payload, $unset: { sale: 1 } });
    } else {
      await document.updateOne({ $set: payload });
    }

    const updatedDocument = await Course.findById(req.params.id);

    return res.status(200).json({
      data: updatedDocument,
      message: 'Course updated successfully!',
    });
  } catch (err) {
    await cleanupFiles(keys);
    throw error(400, err.message);
  }
};
