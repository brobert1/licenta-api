import { paginate, reference, softDelete, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { requiredString } from './schemas/types';

/**
 * Studies are user-created chess courses for personal practice
 */
const name = 'study';
const schema = new Schema(
  {
    author: reference,
    name: requiredString,
    chapters: [reference],
    tags: [reference],
    icon: requiredString,
    color: requiredString,
    course: {
      type: Schema.Types.ObjectId,
      ref: 'course',
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(softDelete);
schema.plugin(validate);

export default model(name, schema);
