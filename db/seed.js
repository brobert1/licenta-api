import { runSeeds } from 'express-goodies/functions';
import * as seeds from './seeds';

const seed = async () => {
  // Add all collection seeds below
  await seeds.identities.seed();
  await seeds.courses.seed();
  // await seeds.reviews.seed();
  // await seeds.drills.seed();
  // await seeds.diagrams.seed();
  // await seeds.studies.seed();
  // await seeds.studiesChapters.seed();
};

const seedMongoDb = async () => {
  await runSeeds(seed);
};

// Execute the seeds
seedMongoDb();
