import { error } from '@functions';
import { studyFilters } from '@functions/filters';
import { Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { query } = req;
  const queryParams = { ...query };
  query.order = 'createdAt-asc';

  if (query.order) {
    const [order, direction] = query.order.split('-');
    queryParams.order = order;
    queryParams.direction = direction === 'asc' ? 1 : -1;
    delete queryParams.sort;
  }

  const filters = studyFilters(req.query, me);
  const studies = await Study.find(filters).paginate(queryParams);

  if (!studies) {
    throw error(404, 'Resource not found');
  }

  return res.status(200).json(studies);
};
