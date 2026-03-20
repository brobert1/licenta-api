import { Professor } from '@controllers';
import { formDataToJson } from '@middleware';
import { Router } from 'express';
import { middleware } from 'express-goodies';

const router = Router();
export default router;

router.all('/professor', middleware.authenticate, middleware.authorize('professor'));
router.all('/professor/*', middleware.authenticate, middleware.authorize('professor'));

router.get('/professor/courses', Professor.listCourses);
router.post('/professor/courses', formDataToJson, Professor.createCourse);
router.get('/professor/courses/:id', Professor.viewCourse);
router.put('/professor/courses/:id', formDataToJson, Professor.updateCourse);
router.delete('/professor/courses/:id', Professor.deleteCourse);
router.put('/professor/content', Professor.updateContent);

router.get('/professor/reviews', Professor.listReviews);
router.get('/professor/reviews/count', Professor.countReviews);
router.put('/professor/reviews/:id/approve', Professor.approveReview);
router.delete('/professor/reviews/:id', Professor.deleteReview);

router.get('/professor/studies/:id', Professor.viewStudy);

router.get('/professor/payments', Professor.listPayments);
router.get('/professor/monthly-payments', Professor.getMonthlySales);
router.get('/professor/monthly-clients', Professor.getMonthlyClients);
