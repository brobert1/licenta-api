/**
 * Parses a PGN string containing multiple games/chapters and extracts
 * individual chapter data with FEN and name extraction
 *
 * @param {string} pgn - The PGN string to parse
 * @param {string} fallbackName - Default name if ChapterName tag not found
 * @param {string} fallbackFen - Default FEN if FEN tag not found
 * @returns {Array} Array of parsed chapter objects with { name, fen, pgn, analysis }
 */
export default function parsePgnChapters(pgn, fallbackName = 'Untitled', fallbackFen = null) {
  if (!pgn) {
    return [];
  }

  const parts = pgn.split(/\n(?=\[Event )/);

  const extractTag = (pgnPart, tagName) => {
    const match = pgnPart.match(new RegExp(`\\[${tagName} "([^"]+)"\\]`, 'i'));
    return match ? match[1] : null;
  };

  const isExercise = (name, remark) => {
    return /exercise/i.test(name) || /exercise/i.test(remark);
  };

  const isDrill = (name, remark) => {
    return /drill/i.test(name) || /drill/i.test(remark);
  };

  return parts.map((part) => {
    const name = extractTag(part, 'ChapterName') || fallbackName;
    const fen = extractTag(part, 'FEN') || fallbackFen;
    const remark = extractTag(part, 'Remark') || '';
    let analysis = 'normal';
    switch (true) {
      case isDrill(name, remark):
        analysis = 'drill';
        break;
      case isExercise(name, remark):
        analysis = 'interactive';
        break;
      default:
        analysis = 'normal';
    }

    return { name, fen, pgn: part, analysis };
  });
}
