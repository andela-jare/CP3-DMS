/* eslint-disable no-console */
/* eslint import/no-unresolved: 0 */
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import routes from './server/app/routes';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);

// Endpoints route
app.use('/', routes.userRoutes);
app.use('/', routes.documentRoutes);
app.use('/roles', routes.roleRoutes);

// Setup a default catch-all route that sends back a welcome message.
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to Document management',
}));

httpServer.listen(port, () => console.log(`Server started at port ${port}`));

// export app for testing
export default app;
