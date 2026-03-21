import { error } from '@functions';
import { DailyStats } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) throw error(404, 'Missing required params');

  const date = new Date().toISOString().slice(0, 10);
  const stats = await DailyStats.findOne({ user: me, date }).lean();

  return res.status(200).json(
    stats || { wins: 0, losses: 0, draws: 0, eloGained: 0 }
  );
};
