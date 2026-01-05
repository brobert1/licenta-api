import { Schema } from 'mongoose';
import { Progress } from '@models';

/**
 * Course progress tracks the chapters completed by a user in a specific course.
 */
const name = 'courseProgress';
const schema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'course',
  },
  completedChapters: {
    type: [Schema.Types.ObjectId], // Array of chapter references
    ref: 'chapter',
  },
});

export default Progress.discriminator(name, schema);
