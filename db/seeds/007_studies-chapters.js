import { Chapter, Study } from '@models';
import chaptersSeeds from '../resources/studies-chapters';

export async function seed() {
  try {
    console.log('Planting seeds for study chapters...');

    const seeds = await chaptersSeeds();
    await Chapter.insertMany(seeds);

    // Also add the chapters to the studies
    const chapters = await Chapter.find({ study: { $exists: true } }).lean();
    const studies = await Study.find({ course: { $exists: true } }).lean();

    for (const study of studies) {
      const studyChapters = chapters.filter((chapter) => {
        return chapter.study && String(chapter.study) === String(study._id);
      });
      await Study.updateOne(
        { _id: study._id },
        { chapters: studyChapters.map((chapter) => chapter._id) }
      );
    }

    console.log('✓');
  } catch (err) {
    console.warn('Error! Cannot insert study chapters');
    console.error(err);
  }
}

