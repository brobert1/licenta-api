import { Review } from '@models';
import reviewsSeeds from '../resources/reviews';

export async function seed() {
  try {
    console.log('Planting seeds for reviews...');

    const seeds = await reviewsSeeds();
    await Review.insertMany(seeds);

    console.log('✓');
  } catch (err) {
    console.warn('Error! Cannot insert reviews');
    console.error(err);
  }
}
