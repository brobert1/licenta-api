import { Client, Identity } from '@controllers';
import { Router } from 'express';
import { middleware } from 'express-goodies';

const router = Router();
export default router;

// Protect all client routes
router.all('/client', middleware.authenticate, middleware.authorize('client', 'admin'));
router.all('/client/*', middleware.authenticate, middleware.authorize('client', 'admin'));

// Courses routes
router.get('/client/courses', Client.listCourses);
router.get('/client/courses/:id', Client.viewCourse);
router.post('/client/courses/:id/claim', Client.claimFreeCourse);
router.get('/client/enrolled-courses', Client.listEnrolledCourses);
router.put('/client/course/:id/enroll', Client.enrollCourse);

// Review routes
router.post('/client/review', Client.createReview);

// Account routes
router.post('/client/change-password', Identity.changePassword);
router.get('/client/account', Identity.profile);
router.put('/client/account', Identity.updateProfile);
router.delete('/client/remove', Identity.remove);
router.put('/client/account/image', Client.uploadImage);
router.delete('/client/account/image', Client.removeImage);
router.put('/client/account/newsletter', Client.updateNewsletter);

// Studies routes
router.get('/client/studies/:id', Client.viewStudy);

// Checkout routes
router.post('/client/checkout', Client.createCheckoutSession);

// Orders routes
router.get('/client/orders', Client.listOrders);

// History routes
router.put('/client/history', Client.addHistory);

// Game routes
router.get('/client/play/history', Client.listGames);
router.get('/client/play/stats', Client.getGameStats);
router.post('/client/play', Client.createGame);
router.get('/client/play/game/:id', Client.viewGame);
