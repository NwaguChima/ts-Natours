import app from './app';

// SERVER
const port: number = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
