import { Identity } from '@controllers';
import { loginSchema, signupSchema } from '@schemas';
import { Router } from 'express';
import { authenticate, authorize, recaptcha, validate } from 'express-goodies/middleware';

const router = Router();
export default router;

router.post('/forgot', recaptcha, Identity.forgot);
router.post('/login', recaptcha, validate(loginSchema), Identity.login);
router.post('/signup', recaptcha, validate(signupSchema), Identity.signup);
router.post('/reset/:hash', recaptcha, Identity.reset);

router.get('/profile', authenticate, Identity.profile);

router.post('/logout', Identity.logout);
router.post('/refresh-token', Identity.refreshToken);
router.get('/courses', Identity.listCourses);

// Shared routes for client and admin
router.all('/studies', authenticate, authorize('client', 'professor'));
router.all('/studies/*', authenticate, authorize('client', 'professor'));

router.get('/studies', Identity.listStudies);
router.post('/studies', Identity.createStudy);
router.get('/studies/trash', Identity.listDeletedStudies);
router.get('/studies/:id', Identity.viewStudy);
router.put('/studies/:id', Identity.updateStudy);
router.put('/studies/:id/delete', Identity.softDeleteStudy);
router.put('/studies/:id/restore', Identity.restoreStudy);
router.delete('/studies/:id', Identity.deleteStudy);
router.post('/studies/:id/clone', Identity.cloneStudy);
router.put('/studies/chapter/reorder', Identity.reorderStudyChapters);
router.put('/studies/chapter/:id', Identity.updateStudyChapter);
router.post('/studies/chapter', Identity.createStudyChapter);
router.delete('/studies/chapter/:id', Identity.deleteStudyChapter);
router.put('/studies/chapter/:id/pgn', Identity.saveChapterPgn);

// Shared routes for client and professor
router.all('/tags', authenticate, authorize('client', 'professor'));
router.all('/tags/*', authenticate, authorize('client', 'professor'));

router.get('/tags', Identity.listTags);
router.post('/tags', Identity.createTag);
router.delete('/tags/:id', Identity.removeTag);
