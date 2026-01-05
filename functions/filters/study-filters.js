export default function (query, authorId) {
  const filter = {
    'author._id': authorId,
  };

  if (query.course && query.course !== '' && query.course !== 'all') {
    filter['course'] = query.course;
  }

  if (query.tag && query.tag !== '') {
    filter['tags.name'] = query.tag;
  }

  return filter;
}
