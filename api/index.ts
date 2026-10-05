import express from 'express';
import { registerHealthApi } from '../src/back-end/health-api.js';
import { registerMoviesApi } from '../src/back-end/movies-api.js';

const app = express();

registerHealthApi(app);
registerMoviesApi(app);

export default app;
