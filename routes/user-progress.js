import { UserProgress } from '@controllers';
import { Router } from 'express';
import { middleware } from 'express-goodies';

const router = Router();
export default router;

// Protect all user-progress routes
router.all('/user-progress', middleware.authenticate, middleware.authorize('client'));
router.all('/user-progress/*', middleware.authenticate, middleware.authorize('client'));

// New user progress routes
router.post('/user-progress/chapters/:chapterId/drill', UserProgress.createDrillProgress);

router.put('/user-progress/:chapterId/mark-completion', UserProgress.markChapterCompleted);
router.put('/user-progress/:chapterId/unmark-completion', UserProgress.unmarkChapterCompleted);
