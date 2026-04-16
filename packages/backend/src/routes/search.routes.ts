import { Router } from 'express';
import { searchPackages } from '../controllers/search.controller';

const router = Router();

router.get('/', searchPackages);

export default router;
