import express from 'express';
import { registerHealthApi } from '../src/back-end/health-api';
import { registerMoviesApi } from '../src/back-end/movies-api';

const app = express();

registerHealthApi(app);
registerMoviesApi(app);

export default app;
