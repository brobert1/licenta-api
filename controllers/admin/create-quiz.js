import { error, parsePgnChapters } from '@functions';
import { Course, Diagram, Quiz } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { name, active, courseName, pgn } = req.body;
  if (!courseName) {
    throw error(400, 'Missing course name');
  }

  if (!pgn) {
    throw error(400, 'PGN is required');
  }

  const course = await Course.findOne({ name: courseName });
  if (!course) {
    throw error(404, 'Course not found');
  }

  const quiz = await Quiz.create({
    name,
    active,
    diagrams: [],
    course: { _id: course._id, name: course.name },
  });

  const parsedChapters = parsePgnChapters(pgn, 'Untitled Diagram');

  const diagrams = [];
  let index = 0;

  for (const parsedChapter of parsedChapters) {
    const diagram = await Diagram.create({
      quiz: { _id: quiz._id, name: quiz.name },
      index,
      name: parsedChapter.name,
      pgn: parsedChapter.pgn,
    });

    diagrams.push({ _id: diagram._id, name: diagram.name });
    index++;
  }

  await Quiz.findByIdAndUpdate(quiz._id, { diagrams });

  return res.status(200).json({
    data: quiz,
    message: 'Quiz created successfully.',
  });
};
