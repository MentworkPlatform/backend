import { Router } from 'express';
import { 
  createConnection, 
  getConnectionsByMentor, 
  getConnectionsByMentee,
  deleteConnection
} from '../controllers/mentorMenteeController';

const router = Router();

// Connection routes
router.post('/', createConnection);
router.get('/mentor/:mentorId', getConnectionsByMentor);
router.get('/mentee/:menteeId', getConnectionsByMentee);
router.delete('/:id', deleteConnection);

export default router;