import { Schema } from 'mongoose';
import Identity from './identity';

/**
 * Professors are identities who create and manage their own courses
 */
const name = 'professor';
const schema = new Schema({
  active: {
    type: Boolean,
    default: true,
  },
});

export default Identity.discriminator(name, schema);
