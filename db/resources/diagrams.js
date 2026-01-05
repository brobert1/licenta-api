import getDiagramsFromPgn from '@db/functions/get-diagrams-from-pgn';
import { Drill } from '@models';

export default async () => {
  const drills = await Drill.find().lean();
  if (!drills.length) {
    throw new Error('No drills found in the database');
  }

  const diagramsData = getDiagramsFromPgn('../pgn/starter-pack.pgn');

  return diagramsData.map(({ index, name, pgn }) => ({
    drill: drills[0],
    index,
    name,
    pgn,
  }));
};
