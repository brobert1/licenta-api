import { paginate, reference, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { requiredString } from './schemas/types';

/**
 * Chapter represents individual units within a study.
 * Chapters are part of a study, which can be standalone or associated with a course.
 */
const name = 'chapter';
const schema = new Schema(
  {
    index: {
      type: Number,
    },
    name: requiredString,
    pgn: {
      type: String,
    },
    study: reference,
    fen: {
      type: String,
    },
    variant: {
      type: String,
    },
    orientation: {
      type: String,
    },
    analysis: {
      type: String,
      default: 'normal',
    },
    video: {
      type: String,
    },
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(validate);

export default model(name, schema);
