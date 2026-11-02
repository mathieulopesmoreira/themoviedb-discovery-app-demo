import express from 'express';
import { registerHealthApi } from './health-api';
import { registerMoviesApi } from './movies-api';
import { registerDiscoverApi } from './discover-api';
import { registerDashboardApi } from './dashboard-api';

// Create a new express application instance
const app = express();

// Define the port number for the server to listen on
const port: number = 3000;

// Register API routes from dedicated modules
registerHealthApi(app);
registerMoviesApi(app);
registerDiscoverApi(app);
registerDashboardApi(app);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Example app in TypeScript listening on port ${port}`);
});
