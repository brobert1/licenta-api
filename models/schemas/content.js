import { Schema } from 'mongoose';

export default new Schema(
  {
    kind: {
      type: String,
      required: true,
      enum: ['study'],
    },
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'study',
    },
    name: { type: String, required: true },
    index: { type: Number, required: true },
  },
  { _id: false }
);
