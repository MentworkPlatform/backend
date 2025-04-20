import { Router } from 'express';
import { 
  findMatches,
  createConnection
} from '../controllers/matchController';

const router = Router();

router.post('/find-matches', findMatches);
router.post('/create-connection', createConnection);

export default router;