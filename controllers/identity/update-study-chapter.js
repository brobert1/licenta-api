import { error, parsePgnChapters } from '@functions';
import { Chapter, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(404, 'Missing required params');
  }

  const { id: chapterId } = req.params;
  const { pgn, name: fallbackName, fen: fallbackFen, analysis } = req.body;

  const existingChapter = await Chapter.findById(chapterId).lean();
  if (!existingChapter) {
    throw error(404, 'Chapter not found');
  }

  if (!pgn) {
    const updatedChapter = await Chapter.findByIdAndUpdate(chapterId, req.body);
    return res.status(200).json({
      data: updatedChapter,
      message: 'Chapter updated',
    });
  }

  const parsedChapters = parsePgnChapters(pgn, fallbackName, fallbackFen);
  const updatedChapters = [];
  const newChapters = [];

  const firstChapter = parsedChapters[0];
  const updatedExistingChapter = await Chapter.findByIdAndUpdate(
    chapterId,
    {
      ...req.body,
      name: firstChapter.name,
      fen: firstChapter.fen,
      pgn: firstChapter.pgn,
    }
  );
  updatedChapters.push(updatedExistingChapter);

  if (parsedChapters.length > 1) {
    const lastChapter = await Chapter.findOne({ study: existingChapter.study })
      .sort({ index: -1 })
      .lean();
    let nextIndex = lastChapter ? lastChapter.index + 1 : existingChapter.index + 1;

    for (let i = 1; i < parsedChapters.length; i++) {
      const parsedChapter = parsedChapters[i];

      const newChapter = await Chapter.create({
        study: existingChapter.study,
        index: nextIndex,
        name: parsedChapter.name,
        fen: parsedChapter.fen,
        pgn: parsedChapter.pgn,
        analysis: parsedChapter.analysis || analysis,
      });

      updatedChapters.push(newChapter);
      newChapters.push(newChapter);
      nextIndex++;
    }

    if (newChapters.length > 0) {
      await Study.findByIdAndUpdate(existingChapter.study, {
        $push: { chapters: { $each: newChapters } },
      });
    }
  }

  return res.status(200).json({
    data: updatedChapters,
    message: 'Chapter created',
  });
};
