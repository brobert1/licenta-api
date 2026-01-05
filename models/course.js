import { paginate, validate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { requiredString, sanitizedString } from './schemas/types';
import { content } from './schemas';

/**
 * Courses are groups of studies and quizzes
 */
const name = 'course';
const schema = new Schema(
  {
    name: requiredString,
    description: sanitizedString,
    active: {
      type: Boolean,
      default: true,
    },
    image: {
      name: String,
      path: String,
      size: Number,
    },
    preview: {
      description: sanitizedString,
      image: {
        name: String,
        path: String,
        size: Number,
      },
    },
    content: [content],
    difficulty: {
      ...requiredString,
      enum: ['novice', 'beginner', 'intermediate', 'advanced', 'expert'],
    },
    author: {
      name: requiredString,
      image: requiredString,
      title: requiredString,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
    },
    currency: {
      type: String,
    },
    sale: {
      isActive: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
      },
      endsAt: {
        type: Date,
      },
    },
    hasMoveTrainer: {
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
