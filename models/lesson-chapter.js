import { Chapter } from '@models';
import { paginate, reference, validate } from 'express-goodies/mongoose';
import { Schema } from 'mongoose';

/**
 * LessonChapter represents individual units within a lesson.
 * LessonChapters are part of a lesson within a course.
 */
const name = 'lessonChapter';
const schema = new Schema(
  {
    lesson: reference,
    video: {
      type: String,
    },
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);
schema.plugin(validate);

export default Chapter.discriminator(name, schema);
