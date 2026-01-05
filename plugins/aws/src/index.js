import { basename, extname } from 'path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import settings from '../settings.js';

const s3Client = new S3Client({
  endpoint: `https://${settings.region}.digitaloceanspaces.com`,
  region: settings.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
  },
  forcePathStyle: false,
});

// Set the folder for the environment
settings.folder = settings.folder[process.env.NODE_ENV] || settings.folder['development'];

// Upload file to AWS or DigitalOcean
export const upload = async (key, data, options = {}) => {
  const params = {
    Bucket: settings.bucket,
    Key: `${settings.folder}/${key}`,
    Body: data,
  };

  // Set params for public files
  if (options?.public) {
    params.ACL = 'public-read';
  }

  const command = new PutObjectCommand(params);
  try {
    return {
      response: await s3Client.send(command),
      path: getPublicUrl(key),
    };
  } catch (err) {
    console.error('Error uploading to DigitalOcean', err);
    throw err;
  }
};

// Remove file from AWS or DigitalOcean
export const remove = async (key) => {
  const params = {
    Bucket: settings.bucket,
    Key: `${settings.folder}/${key}`,
  };

  const command = new DeleteObjectCommand(params);
  try {
    return await s3Client.send(command);
  } catch (err) {
    console.error('Error removing from DigitalOcean', err);
    throw err;
  }
};

// Create an unique key for the file
export const createKey = (filename) => {
  const extension = extname(filename);
  const timestamp = Date.now();
  const normalized = filename.toLowerCase().replaceAll(' ', '-');
  const file = basename(normalized, extension);

  return `${file}-${timestamp}${extension}`;
};

// Get the key from the full path
export const getKey = (path) => {
  return basename(path);
};

// Get the public URL of the file
export const getPublicUrl = (filename) => {
  return `https://${settings.bucket}.${settings.region}.digitaloceanspaces.com/${settings.folder}/${filename}`;
};

// Download file from AWS or DigitalOcean
export const download = async (filename) => {
  const params = {
    Bucket: settings.bucket,
    Key: `${settings.folder}/${filename}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const response = await s3Client.send(command);
    const data = await new Promise((resolve, reject) => {
      const chunks = [];
      response.Body.on('data', (chunk) => chunks.push(chunk));
      response.Body.on('error', (err) => reject(err));
      response.Body.on('end', () => resolve(Buffer.concat(chunks)));
    });
    return data;
  } catch (err) {
    console.error('Error downloading from DigitalOcean', err);
    throw err;
  }
};

export const downloadFile = (path) => {
  return download(getKey(path));
};
