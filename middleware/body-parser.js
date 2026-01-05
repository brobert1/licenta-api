import { json } from 'express';

/**
 * Custom body parser middleware that skips JSON parsing for webhook routes
 * to allow Stripe signature verification
 */
const bodyParser = (req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    json()(req, res, next);
  }
};

export default bodyParser;
