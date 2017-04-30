/* eslint-disable no-console */
/* eslint import/no-unresolved: 0 */
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './server/app/routes';

dotenv.config();
const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Endpoints route
app.use('/', routes.userRoutes);
app.use('/', routes.documentRoutes);
app.use('/roles', routes.roleRoutes);

// Setup a default catch-all route that sends back a welcome message.
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to Document Management System!',
}));

if (!module.parent) {
  httpServer.listen(port, () => console.log(`Server started at port ${port}`));
}

// export app for testing
export default app;
