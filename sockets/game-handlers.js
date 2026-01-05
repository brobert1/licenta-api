
export const joinQueue = (io, socket, { timeControl }) => {
  console.log(`User ${socket.user._id} joined queue for ${timeControl}`);
  // TODO: Implement matchmaking logic
  socket.emit('queueJoined', { timeControl });
};

export const leaveQueue = (io, socket) => {
  console.log(`User ${socket.user._id} left queue`);
  // TODO: Implement leave queue logic
};

export const makeMove = (io, socket, { gameId, move }) => {
  console.log(`Move in game ${gameId}:`, move);
  // TODO: Implement move validation and propagation
};

export const gameAction = (io, socket, { gameId, action }) => {
  console.log(`Action in game ${gameId}:`, action);
  // TODO: Implement resign, draw, etc.
};

export const disconnectSocket = (io, socket) => {
    // TODO: Handle user disconnect (remove from queue, etc)
    leaveQueue(io, socket);
}
