export default function (query, userId, userName) {
  const filter = { 'user._id': userId };

  // Filter by piece color
  if (query.color === 'white') {
    filter.white = userName;
  } else if (query.color === 'black') {
    filter.black = userName;
  }

  return filter;
}
