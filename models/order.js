import { paginate, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';

/**
 * Orders are records of course acquisitions (both free and paid)
 */
const name = 'order';
const schema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'course',
      required: true,
    },
    identity: {
      type: Schema.Types.ObjectId,
      ref: 'identity',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'EUR',
    },
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(validate);

export default model(name, schema);
