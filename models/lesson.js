import { paginate, reference, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { requiredString } from './schemas/types';

/**
 * Lessons represent individual units within a course.
 * Each lesson is associated with a course and include chapters
 */
const name = 'lesson';
const schema = new Schema(
  {
    course: reference,
    chapters: [reference],
    name: requiredString,
    isFree: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(validate);

export default model(name, schema);
