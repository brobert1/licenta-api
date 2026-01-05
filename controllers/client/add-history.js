import { error } from '@functions';
import { Identity } from '@models';
import History from '@models/history';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(400, 'Missing required params');
  }

  const user = await Identity.findById(me).lean();
  if (!user) {
    throw error(404, 'User not found');
  }

  const { drillId, diagramId, move } = req.body;
  if (!drillId || !diagramId) {
    throw error(400, 'drillId and diagramId are required');
  }

  const filter = { client: me, drill: drillId, diagram: diagramId };

  let update;
  const options = {};
  if (move) {
    update = { $addToSet: { wrongMoves: move } };
    options.upsert = true;
  } else {
    update = { $unset: { wrongMoves: '' } };
  }

  const history = await History.findOneAndUpdate(filter, update, options);

  return res.status(200).json({ data: history });
};
