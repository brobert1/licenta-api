import { Course } from '@models';
import coursesSeeds from '../resources/courses';

export async function seed() {
  try {
    console.log('Planting seeds for courses...');

    const seeds = await coursesSeeds();
    await Course.insertMany(seeds);

    console.log('✓');
  } catch (err) {
    console.warn('Error! Cannot insert courses');
    console.error(err);
  }
}
