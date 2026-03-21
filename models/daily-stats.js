import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'identity', required: true },
    date: { type: String, required: true }, // UTC date string: "2026-03-21"
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    eloGained: { type: Number, default: 0 }, // cumulative ELO delta for live games
  },
  { timestamps: false }
);

schema.index({ user: 1, date: 1 }, { unique: true });

export default model('dailystats', schema);
