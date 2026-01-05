import { error } from '@functions';
import { Client } from '@models';

export default async (req, res) => {
  const { id } = req.params;
  const { me } = req.user;

  if (!id || !me) {
    throw error(404, 'Missing required params');
  }

  const client = await Client.findById(id);
  if (!client) {
    throw error(404, 'Client not found');
  }

  await client.remove();

  return res.status(200).json({
    data: client,
    message: 'Client deleted successfully',
  });
};
