import { Router } from 'express';
import { getHealth, getLiveness, getReadiness, getMetrics } from '../controllers/healthController';

const router = Router();

router.get('/', getHealth);
router.get('/liveness', getLiveness);
router.get('/readiness', getReadiness);
router.get('/metrics', getMetrics);

export default router;
