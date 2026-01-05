import { paginate, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';

/**
 * Progress tracks the chapters completed by a user in a specific course or quiz.
 */
const name = 'progress';
const schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true, collection: 'progress' }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(validate);

export default model(name, schema);
