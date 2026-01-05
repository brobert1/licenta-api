import { error, parsePgnChapters } from '@functions';
import { Chapter, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const {
    study,
    name: fallbackName,
    variant,
    orientation,
    analysis,
    fen: fallbackFen,
    pgn,
  } = req.body;

  const lastChapter = await Chapter.findOne({ 'study._id': study._id })
    .sort({ index: -1 })
    .limit(1)
    .lean();

  let nextIndex = lastChapter ? lastChapter.index + 1 : 0;

  if (!pgn) {
    const chapter = await Chapter.create({
      study,
      name: fallbackName,
      variant,
      orientation,
      analysis,
      fen: fallbackFen,
      index: nextIndex,
    });

    await Study.findByIdAndUpdate(
      study._id,
      {
        $push: {
          chapters: chapter,
        },
      }
    );

    return res.status(200).json({
      data: chapter,
      message: 'Chapter created',
    });
  }

  const parsedChapters = parsePgnChapters(pgn, fallbackName, fallbackFen);
  const createdChapters = [];

  for (const parsedChapter of parsedChapters) {
    const chapter = await Chapter.create({
      study,
      name: parsedChapter.name,
      variant,
      orientation,
      analysis: parsedChapter.analysis || analysis,
      fen: parsedChapter.fen,
      pgn: parsedChapter.pgn,
      index: nextIndex,
    });

    createdChapters.push(chapter);
    nextIndex++;
  }

  await Study.findByIdAndUpdate(
    study._id,
    {
      $push: {
        chapters: { $each: createdChapters },
      },
    }
  );

  return res.status(200).json({
    data: createdChapters,
    message: 'Chapter created',
  });
};
