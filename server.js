import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('Auth Backend running'));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

app.use(notFound);
app.use(errorHandler);



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`));
