/* eslint-disable no-console */
/* eslint import/no-unresolved: 0 */
import http from 'http';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import routes from './server/app/routes';

const app = express();
const router = express.Router();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);
routes.userRoutes(app);

httpServer.listen(port, () => console.log(`Server started at port ${port}`));

// export app for testing
export default app;
