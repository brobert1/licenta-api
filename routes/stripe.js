import { Router, raw } from 'express';
import { Stripe } from '@controllers';

const router = Router();

router.post('/webhook', raw({ type: 'application/json' }), Stripe.webhook);

export default router;
