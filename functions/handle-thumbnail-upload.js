import { createKey } from '@plugins/aws/src';
import uploadDocument from './upload-document';

const handleThumbnailUpload = async (thumbnail, payload, keys) => {
  const key = createKey(thumbnail.name);
  const thumbnailData = await uploadDocument(thumbnail, key);
  payload.image = {
    name: thumbnail.name,
    path: thumbnailData.path,
    size: thumbnail.size,
  };
  payload.preview.image = {
    name: thumbnail.name,
    path: thumbnailData.path,
    size: thumbnail.size,
  };
  keys.push(key);
};

export default handleThumbnailUpload;
