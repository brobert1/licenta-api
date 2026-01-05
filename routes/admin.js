import { Admin } from '@controllers';
import { formDataToJson } from '@middleware';
import { Router } from 'express';
import { middleware } from 'express-goodies';

const router = Router();
export default router;

// Protect all client routes
router.all('/admin', middleware.authenticate, middleware.authorize('admin'));
router.all('/admin/*', middleware.authenticate, middleware.authorize('admin'));

// Courses routes
router.get('/admin/courses', Admin.listCourses);
router.post('/admin/courses', formDataToJson, Admin.createCourse);
router.get('/admin/courses/:id', Admin.viewCourse);
router.put('/admin/courses/:id', formDataToJson, Admin.updateCourse);
router.delete('/admin/courses/:id', Admin.deleteCourse);
router.put('/admin/content', Admin.updateContent);

// Clients routes
router.get('/admin/clients', Admin.listClients);
router.get('/admin/clients/:id', Admin.getClient);
router.post('/admin/clients', Admin.createClient);
router.put('/admin/clients/:id', Admin.updateClient);
router.delete('/admin/clients/:id', Admin.deleteClient);

// Reviews routes
router.get('/admin/reviews', Admin.listReviews);
router.get('/admin/reviews/count', Admin.countReviews);
router.put('/admin/reviews/:id/approve', Admin.approveReview);
router.delete('/admin/reviews/:id', Admin.deleteReview);

// Studies routes
router.get('/admin/studies/:id', Admin.viewStudy);

// Payments routes
router.get('/admin/payments', Admin.listPayments);
router.get('/admin/monthly-payments', Admin.getMonthlySales);
router.get('/admin/monthly-clients', Admin.getMonthlyClients);
