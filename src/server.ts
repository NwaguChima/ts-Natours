import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
import app from './app';

const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.PASSWORD!
) as string;

mongoose.connect(DB).then(() => {
  console.log('DB connections successful...');
});

// SERVER
const port: number = +process.env.PORT! || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
