import { Public } from '@controllers';
import { Router } from 'express';

const router = Router();
export default router;

router.get('/public/check-sale', Public.checkSale);
