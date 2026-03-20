import { error, generateDarkHexColor } from '@functions';
import { Chapter, Course, Identity, Study } from '@models';

export default async (req, res) => {
  const { me } = req.user;
  if (!me) {
    throw error(400, 'Missing required params');
  }

  const author = await Identity.findById(me);
  if (!author) {
    throw error(404, 'Author not found');
  }

  const { name, icon, course } = req.body;
  if (!name || !icon) {
    throw error(400, 'Name and icon are required');
  }

  const color = generateDarkHexColor();

  const studyData = {
    author,
    name,
    icon,
    color,
    chapters: [],
  };

  // Only add course if it's provided and not empty and if the user is a professor
  if (author?.__t === 'professor' && course) {
    studyData.course = course;
  }

  const study = await Study.create(studyData);

  const firstChapter = await Chapter.create({
    study,
    name: 'Chapter 1',
    index: 0,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  });

  study.chapters.push({
    _id: firstChapter._id,
    name: firstChapter.name,
  });
  await study.save();

  // Add study to course content if course is provided and user is professor
  if (author?.__t === 'professor' && course) {
    const courseDoc = await Course.findById(course);
    if (courseDoc) {
      const nextIndex = courseDoc.content.length;
      courseDoc.content.push({
        kind: 'study',
        _id: study._id,
        name: study.name,
        index: nextIndex,
      });
      await courseDoc.save();
    }
  }

  return res.status(201).json({
    data: study,
    message: 'Study created successfully',
  });
};
