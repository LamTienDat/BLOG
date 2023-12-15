// app.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose, { ConnectOptions } from 'mongoose';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import blogRoutes from './routes/blogRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:admin@cluster0.e4pmngo.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions)

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/blog', blogRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
