import { error } from '@functions';
import { Diagram, Progress, Drill, History } from '@models';

export default async (req, res) => {
  const { id } = req.params;
  const { me } = req.user;

  if (!id || !me) {
    throw error(404, 'Missing required params');
  }

  const drill = await Drill.findById(id).lean();
  if (!drill) {
    throw error(404, 'Drill not found');
  }

  // Retrieve progress for the current user for this drill
  const userProgress = await Progress.findOne({ user: me, drill: drill._id }).lean();
  const userCompletedDiagrams = userProgress?.completedDiagrams.map(String) || [];

  // Fetch the chapters associated with the drill
  const diagramIds = drill.diagrams.map((diagram) => diagram._id) || [];
  let diagrams = await Diagram.find({ _id: { $in: diagramIds } })
    .sort({ index: 1 })
    .lean();

  const histories = await History.find({
    client: me,
    drill: drill._id,
    diagram: { $in: diagramIds },
  }).lean();

  const movesByDiagram = histories.reduce((map, hist) => {
    map[hist.diagram.toString()] = hist.wrongMoves || [];
    return map;
  }, {});

  // Mark chapters as completed based on user progress
  diagrams = diagrams.map((diagram) => ({
    ...diagram,
    isCompleted: userCompletedDiagrams.includes(diagram._id.toString()),
    mistakes: movesByDiagram[diagram._id.toString()] || [],
  }));

  const response = {
    ...drill,
    diagrams,
  };

  return res.status(200).json(response);
};
