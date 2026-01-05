import { reference } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { requiredString } from './schemas/types';

/**
 * Tags are used to categorize studies
 */
const name = 'tag';
const schema = new Schema(
  {
    user: reference,
    name: requiredString,
  },
  { timestamps: true }
);

export default model(name, schema);
