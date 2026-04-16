import { Router } from 'express';
import { getActivity } from '../controllers/activity.controller';

const router = Router();

router.get('/', getActivity);

export default router;
