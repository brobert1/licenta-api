export default function (query) {
  const filter = { active: true };

  if (query.difficulty && query.difficulty !== '') {
    filter.difficulty = query.difficulty;
  }

  return filter;
}
