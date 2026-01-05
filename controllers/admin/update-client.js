import { error } from '@functions';
import { Client } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { id } = req.params;
  const payload = { ...req.body };

  const document = await Client.findById(id).lean();
  if (!document) {
    throw error(404, 'Error! The client was not found.');
  }

  const updatedClient = await Client.findByIdAndUpdate(id, payload);

  return res.status(200).json({
    data: updatedClient,
    message: 'Client updated successfully',
  });
};
