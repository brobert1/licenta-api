import { error, randomHash } from '@functions';
import { Identity, Reset } from '@models';
import { sendEmail } from '@plugins/postmark/src';

export default async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw error(400, 'Missing required params');
  }

  const identity = await Identity.findOne({ email }).select('_id');
  if (!identity) {
    throw error(404, 'Account does not exist');
  }

  const hash = randomHash();
  await Reset.deleteMany({ identity });
  await Reset.create({ hash, identity });

  // Send an email with the reset link
  await sendEmail({
    to: email,
    subject: 'Password reset',
    type: 'reset',
    data: {
      reset_link: `${process.env.APP_BASE_URL}/reset/${hash}`,
    },
  });

  return res.status(200).json({ success: true });
};
