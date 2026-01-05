import { paginate, reference, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';

/**
 * Reviews are user feedback on courses
 */
const name = 'review';
const schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'identity',
      required: true,
    },
    course: reference,
    name: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      // Compress multi spaces to single space
      set: (value) => value.replace(/\s+/g, ' '),
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(validate);

export default model(name, schema);
