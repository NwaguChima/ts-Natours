const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { default: Tour } = require('../../dist/model/tourModel');
const { default: Review } = require('../../dist/model/reviewModel');
const { default: User } = require('../../dist/model/userModel');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => {
  console.log('DB connections successful...');
});

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    // console.log(Tour.default.);
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
// node dev-data/data/import-dev-data.js --import

console.log(process.argv);
