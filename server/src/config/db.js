import mongoose from 'mongoose';
import winston from 'winston';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    winston.info('MongoDB connected');
  } catch (err) {
    winston.error(err);
    process.exit(1);
  }
};
