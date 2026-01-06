import { paginate } from 'express-goodies/mongoose';
import { Schema, model } from 'mongoose';
import { sanitizedString } from './schemas/types';

/**
 * Games are chess matches between the user and the computer OR between two users
 */
const name = 'game';
const schema = new Schema(
  {
    type: {
      type: String,
      enum: ['bot', 'live'],
      default: 'bot',
    },
    // For bot games - optional for live games
    user: {
      type: Schema.Types.ObjectId,
      ref: 'identity',
    },
    // For live games
    whitePlayer: {
      type: Schema.Types.ObjectId,
      ref: 'identity',
    },
    blackPlayer: {
      type: Schema.Types.ObjectId,
      ref: 'identity',
    },
    white: {
      type: String,
      required: true,
    },
    black: {
      type: String,
      required: true,
    },
    result: sanitizedString, // "1-0", "0-1", "1/2-1/2", "*"
    status: {
      type: String,
      enum: ['active', 'completed', 'aborted'],
      default: 'completed',
    },
    moves: Number,
    pgn: {
      type: String,
      default: '',
    },
    opening: {
      type: String,
      default: 'Starting position',
    },
    fen: String,
    uciMoves: [String],
    timeControl: {
      initial: Number, // seconds
      increment: Number, // seconds
    },
    whiteTimeRemaining: Number,
    blackTimeRemaining: Number,
    lastMoveAt: Date, // Timestamp of last move for time tracking
    lastDrawOfferAt: Date, // Timestamp for cooldown
    lastDrawOfferBy: String, // 'white' or 'black'
  },
  { timestamps: true }
);

// Set schema plugins
schema.plugin(paginate);

export default model(name, schema);
