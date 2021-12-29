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

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.7,
  price: 497,
});
testTour
  .save()
  .then((doc: any) => {
    console.log(doc);
  })
  .catch((err: any) => {
    console.log('ERROR 💥', err);
  });

// SERVER
const port: number = +process.env.PORT! || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
