/**
 * Calculate expected score based on ratings
 * @param {number} ratingA Player A rating
 * @param {number} ratingB Player B rating
 * @returns {number} Expected score for Player A (0-1)
 */
const getExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Calculate new rating
 * @param {number} currentRating Current player rating
 * @param {number} opponentRating Opponent player rating
 * @param {number} actualScore 1 for win, 0.5 for draw, 0 for loss
 * @param {number} kFactor volatility factor (default 32)
 * @returns {number} New rating
 */
export const calculateNewRating = (currentRating, opponentRating, actualScore, kFactor = 32) => {
  const expectedScore = getExpectedScore(currentRating, opponentRating);
  const newRating = Math.round(currentRating + kFactor * (actualScore - expectedScore));
  return newRating;
};
