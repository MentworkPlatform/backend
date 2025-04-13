import { Router } from 'express';
import { 
  findMatches,
  createMenteeWithConnection
} from '../controllers/matchController';

const router = Router();

router.post('/find-matches', findMatches);
router.post('/create-mentee-with-connection', createMenteeWithConnection);

export default router;