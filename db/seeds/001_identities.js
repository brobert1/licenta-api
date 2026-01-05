import { Identity } from '@models';
import identitiesSeeds from '../resources/identities';

export async function seed() {
  try {
    console.log('Planting seeds for identities...');

    const seeds = await identitiesSeeds();
    await Identity.insertMany(seeds);

    console.log('✓');
  } catch (err) {
    console.warn('Error! Cannot insert identities');
    console.error(err);
  }
}
