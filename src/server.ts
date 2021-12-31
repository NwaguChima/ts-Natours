import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 🥵, shutting down ...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

dotenv.config();
import app from './app';

const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.PASSWORD!
) as string;

mongoose.connect(DB).then(() => {
  console.log('DB connections successful...');
});
// .catch((err) => console.log(err));

// SERVER
const port: number = +process.env.PORT! || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 🥵, shutting down ...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
