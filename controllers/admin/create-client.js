import { error } from '@functions';
import { Client, Identity } from '@models';
import { sendEmail } from '@plugins/postmark/src';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { email, password, confirmPassword } = req.body;
  const alreadyExists = await Identity.findOne({ email }).lean();
  if (alreadyExists) {
    throw error(400, 'This account already exists');
  }

  if (password !== confirmPassword) {
    throw error(400, 'Passwords do not match');
  }

  const document = await Client.create(req.body);
  if (!document) {
    throw error(400, 'Could not create your new account');
  }

  await sendEmail({
    to: email,
    subject: 'A warm welcome to our chess platform',
    type: 'signup',
  });

  return res.status(200).json({
    data: document,
    message: 'Client created successfully',
  });
};
