const fs = require('fs');
const path = require('path');
const { capitalize } = require('lodash');

const getDiagramsFromPgn = (filePath) => {
  const fullPath = path.join(__dirname, filePath);
  const raw = fs.readFileSync(fullPath, 'utf8');

  if (!raw) {
    throw new Error('PGN file is empty');
  }

  // Split on any newline that is immediately followed by "[Event "
  const parts = raw.split(/\n(?=\[Event )/);

  const diagrams = [];
  let index = 0;

  for (const part of parts) {
    const chapterNameMatch = part.match(/\[ChapterName "([^"]+)"\]/);
    const name = chapterNameMatch ? capitalize(chapterNameMatch[1]) : `Diagram ${index + 1}`;

    diagrams.push({
      index,
      name,
      pgn: part.trim(),
    });

    index++;
  }

  return diagrams;
};

export default getDiagramsFromPgn;
