import { error } from '@functions';
import { Client } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { id } = req.params;

  if (!id) {
    throw error(400, 'Client ID is required');
  }

  const client = await Client.findById(id).lean();
  if (!client) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(client);
};
