import { paginate, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { requiredString } from './schemas/types';

/**
 * Diagrams represent individual units within a quiz.
 * Diagrams are part of a quiz.
 */
const name = 'diagram';
const schema = new Schema(
  {
    index: {
      type: Number,
    },
    name: requiredString,
    pgn: requiredString,
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(validate);

export default model(name, schema);
