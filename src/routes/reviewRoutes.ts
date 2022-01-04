import express from 'express';
import authController from '../controllers/authController';
import reviewController from '../controllers/reviewController';

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

export default router;
