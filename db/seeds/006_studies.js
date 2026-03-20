import { Course, Study } from '@models';
import studiesSeeds from '../resources/studies';

export async function seed() {
  try {
    console.log('Planting seeds for studies...');

    const seeds = await studiesSeeds();
    await Study.insertMany(seeds);

    // Also add the course-related studies to the courses as content
    const studies = await Study.find({ course: { $exists: true } }).lean();
    const courses = await Course.find().lean();

    for (const course of courses) {
      const courseStudies = studies.filter((study) => {
        return study.course && String(study.course) === String(course._id);
      });

      const contentItems = courseStudies.map((study, index) => ({
        kind: 'study',
        _id: study._id,
        name: study.name,
        index: index,
      }));

      await Course.updateOne({ _id: course._id }, { content: contentItems });
    }

    console.log('✓');
  } catch (err) {
    console.warn('Error! Cannot insert studies');
    console.error(err);
  }
}
