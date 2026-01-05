const { error } = require('@functions');
const { Client } = require('@models');
const { isBoolean } = require('lodash');

export default async (req, res) => {
  const { me } = req.user;
  const { isNewsletter } = req.body;

  if (!me) {
    throw error(404, 'Missing required params');
  }

  if (!isBoolean(isNewsletter)) {
    throw error(400, 'Invalid subscription value');
  }

  const client = await Client.findById(me);
  if (!client) {
    throw error(404, 'Client not found');
  }

  client.isNewsletter = isNewsletter;
  await client.save();

  return res.status(200).json({
    data: client,
    message: 'Subscription updated',
  });
};
