import { error, uploadFiles } from '@functions';
import { cleanupFiles } from '@functions/cleanup-files';
import { Course } from '@models';
import { getKey } from '@plugins/aws/src';

export default async (req, res) => {
  const document = await Course.findById(req.params.id);
  if (!document) {
    throw error(404, 'Error! The course was not found.');
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
      // Ensure the payload does not carry stale values
      delete payload.price;
      delete payload.currency;
      delete payload.sale;
      await document.updateOne({
        $set: payload,
        $unset: { price: 1, currency: 1, sale: 1 },
      });
    } else if (payload?.sale?.isActive === false) {
      // Clearing sale-specific fields when turning off sale
      delete payload.sale;
      await document.updateOne({ $set: payload, $unset: { sale: 1 } });
    } else {
      await document.updateOne({ $set: payload });
    }

    // Reload document to get the updated state from DB
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
