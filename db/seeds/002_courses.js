import { Course, Identity } from '@models';
import coursesSeeds from '../resources/courses';

export async function seed() {
  try {
    console.log('Planting seeds for courses...');

    const professors = await Identity.find({ __t: 'professor' }).lean();
    const authorToId = {};
    professors.forEach((p) => {
      authorToId[p.name] = p._id;
    });

    const seeds = await coursesSeeds();
    const coursesWithCreator = seeds.map((course) => ({
      ...course,
      createdBy: authorToId[course.author?.name] || null,
    }));

    await Course.insertMany(coursesWithCreator);

    console.log('✓');
  } catch (err) {
    console.warn('Error! Cannot insert courses');
    console.error(err);
  }
}
