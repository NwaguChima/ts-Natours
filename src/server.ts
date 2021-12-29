import dotenv from 'dotenv';

dotenv.config();

import app from './app';
// SERVER
const port: number = +process.env.PORT! || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
