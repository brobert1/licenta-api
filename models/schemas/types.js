const requiredString = {
  type: String,
  required: true,
};

const requiredNumber = {
  type: Number,
  required: true,
};

const sanitizedString = {
  type: String,
  // Compress multi spaces to single space
  set: (value) => value.replace(/\s+/g, ' '),
};

export { requiredNumber, requiredString, sanitizedString };
