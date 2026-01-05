import cookieParser from 'cookie-parser';
import express, { urlencoded } from 'express';
import 'express-async-errors';
import fileUpload from 'express-fileupload';
import { connectToMongo, setupCors } from 'express-goodies';
import helmet from 'helmet';
import mongoose from 'mongoose';
import bodyParserMiddleware from './middleware/body-parser';
import router from './router';

const app = express();

// Set Mongoose defaults - return updated documents by default
mongoose.set('returnOriginal', false);

// Connect to the database using a cached connection when available
connectToMongo();

// Configure express app

// Skip body parsing for webhook routes to allow Stripe signature verification
app.use(bodyParserMiddleware);

app.use(urlencoded({ extended: false }));
app.use(helmet());
app.use(fileUpload());
app.use(cookieParser(process.env.COOKIE_SECRET));

// Custom cors config
app.use(setupCors());

// Route everything
app.use(router);

// Crons
import '@crons/expire-course-sales';

export default app;
