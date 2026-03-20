import { error, handleThumbnailUpload } from '@functions';
import { cleanupFiles } from '@functions/cleanup-files';
import { Course, Identity } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const author = await Identity.findById(me);
  const { files, body } = req;
  const keys = [];

  try {
    const payload = {
      ...body,
      author: {
        title: 'IM',
        image: '/images/alex-banzea-profile.jpg',
        name: author?.name,
      },
      createdBy: me,
      preview: {
        description: body.description,
      },
    };

    if (payload?.isPaid === false) {
      delete payload.price;
      delete payload.currency;
      delete payload.sale;
    } else if (payload?.sale?.isActive === false) {
      delete payload.sale;
    }

    if (files?.image) {
      await handleThumbnailUpload(files.image, payload, keys);
    }
    const document = await Course.create(payload);

    return res.status(200).json({
      data: document,
      message: 'Course created successfully',
    });
  } catch (err) {
    await cleanupFiles(keys);
    throw error(400, err.message);
  }
};
