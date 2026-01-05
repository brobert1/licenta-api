import { error } from '@functions';
import { Identity } from '@models';

export default async (req, res) => {
  const { me } = req.user;

  if (!me) {
    throw error(404, 'Missing required params');
  }

  const account = await Identity.findById(me);
  if (!account) {
    throw error(404, 'Account not found');
  }

  await account.deleteOne();

  return res.status(200).json({
    data: account,
    message: 'Account deleted successfully',
  });
};
