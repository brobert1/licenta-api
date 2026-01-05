import { Schema, model } from 'mongoose';

/**
 * History represents the history of a user's drill moves.
 */
const name = 'history';
const schema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'client',
    },
    drill: {
      type: Schema.Types.ObjectId,
      ref: 'drill',
    },
    diagram: {
      type: Schema.Types.ObjectId,
      ref: 'diagram',
    },
    wrongMoves: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export default model(name, schema);
