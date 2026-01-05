import { paginate, reference } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { requiredString, sanitizedString } from './schemas/types';

/**
 * Games are chess matches between the user and the computer
 */
const name = 'game';
const schema = new Schema(
  {
    user: reference,
    white: requiredString,
    black: requiredString,
    result: sanitizedString,
    moves: Number,
    pgn: requiredString,
    opening: requiredString,
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);

export default model(name, schema);
