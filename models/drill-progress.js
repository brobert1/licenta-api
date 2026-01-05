import { Progress } from '@models';
import { Schema } from 'mongoose';
import { wrongMoves } from './schemas';

/**
 * Drill progress tracks drill statistics for chapters with analysis='drill' in studies.
 */
const name = 'drillProgress';
const schema = new Schema({
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'chapter',
  },
  goodMoves: {
    type: Number,
  },
  totalMoves: {
    type: Number,
  },
  accuracy: {
    type: Number,
  },
  wrongMoves: {
    type: [wrongMoves],
  },
});

export default Progress.discriminator(name, schema);
