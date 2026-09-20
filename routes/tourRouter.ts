import express from 'express';
import tourController from '../controllers/tourController';

const router = express.Router(); //express.Router() --> Express ka ek separate mini-router create karo jo tours se related routes handle karega.

// router.param('id', tourController.checkID);

router.route('/top-5-cheap').get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/') //.route ka benefit hai ki same path ke different HTTP methods ko ek jagah group kar sakte ho.
  .get(tourController.getAllTours)
  .post(tourController.createTour); // Bas route() ka benefit ye hai ki same path ke multiple HTTP methods ko ek jagah group kar sakte ho.
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

export default router;
