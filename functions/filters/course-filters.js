export default function (query) {
  const filter = { active: true };

  if (query.difficulty && query.difficulty !== '') {
    filter.difficulty = query.difficulty;
  }

  if (query.search && query.search.length >= 3) {
    filter.name = { $regex: query.search, $options: 'i' };
  }

  // TODO: Add all filters (game aspect, popular filters)

  return filter;
}
