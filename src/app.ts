import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import pool from './db';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());

pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err.stack));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Mentwork API V1');
});

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});